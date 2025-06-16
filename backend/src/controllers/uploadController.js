const path = require("path");
const fs = require("fs");
const { makePreview } = require("../utils/makePreview");
const { encryptAndUploadPDF } = require("../utils/encrypt-upload"); // takes a buffer, returns { cid, key, iv }
const { uploadJSONToIPFS, uploadFileToIPFS } = require("../utils/ipfs");
const {saveAESKey }=  require("../utils/saveAESKey");
// const {saveAESKey }=  require("../utils/saveAESKey");
const { ethers } = require("ethers");
const { abi } = require("../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json");
 
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;


exports.handleUpload = async(req, res) => {
    try {
          

        console.log("📥 Upload endpoint hit");

        // ✅ Extract user wallet address from JWT
        const userWalletAddress = req.user?.address;
        console.log("req.user::",req.user);
        console.log("userWalletAddress::",userWalletAddress);
        if (!userWalletAddress) {
            console.warn("⚠️ No wallet address found in JWT");
            return res.status(401).json({ error: "User wallet address not found" });
        }
        console.log("👤 User wallet address:", userWalletAddress);

        // ✅ Extract files
        const pdfFile = req.files?.file?.[0];
        const coverImage = req.files?.coverImage?.[0]; // Optional
        console.log("📄 PDF file received:", !!pdfFile);
        console.log("🖼️ Cover image received:", !!coverImage);

        if (!pdfFile) {
            console.warn("⚠️ No PDF file provided");
            return res.status(400).json({ error: "PDF file is required" });
        }

        // ✅ Extract fields from form-data
        const {
            title,
            description,
            price,
            licenseType,
            blurLevel,
            categories: categoriesRaw,
            firstPagesCount
        } = req.body;

        console.log("📋 Received fields:", {
            firstPagesCount,
            title,
            description,
            price,
            licenseType,
            blurLevel,
            rawCategories: categoriesRaw,
        });

        const categories = JSON.parse(categoriesRaw || "[]");

        if (!title || !price) {
            console.warn("⚠️ Missing required metadata fields");
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pdfBuffer = fs.readFileSync(pdfFile.path);
        console.log("pdfFile.path::>>", pdfFile.path)
        console.log("📦 PDF buffer read from disk, size:", pdfBuffer.length);

        // 🔐 Encrypt PDF
        console.log("🔐 Starting PDF encryption and upload...");
        console.log("pdfBuffer_before_ecryptionAndUpload::>>", pdfBuffer);
        const { cid: encryptedCid, key, iv } = await encryptAndUploadPDF({inputPDF:pdfBuffer});

        console.log("✅ PDF encrypted and uploaded to IPFS");
        console.log("🔑 Encryption Key:", key.toString("hex")); // TODO: secure later
        console.log("🔐 Encrypted CID:", encryptedCid);
        console.log("🧬 IV:", iv);

        // 🌫️ Create preview
        console.log("🌫️ Generating preview ");
        const { jsonCID  } = await makePreview({
            inputPDFPath: pdfFile.path,
            patchWidth: null,
            patchHeight: 25,
            blurPercentage: parseInt(blurLevel) / 100,
            blurStrength: 15,
            unblurredPages :firstPagesCount
        });
        console.log("parseInt(blurLevel) / 100,::",parseInt(blurLevel) / 100);
        previewCid = jsonCID


        console.log("✅ Preview generated");
        console.log("📸 Preview CID:", previewCid);
        


        // 📝 Upload description JSON
        console.log("📝 Uploading description to IPFS...");
        // Add error handling to the uploadJSONToIPFS call
// try {
//     console.log("📝 Uploading description to IPFS...");
//     console.log("description::::"+description)
//     const descriptionCid = await uploadJSONToIPFS({ description });
//     console.log("✅ Description uploaded:", descriptionCid);
// } catch (error) {
//     console.error("❌ Error uploading description to IPFS:", error);
//     throw error; // Re-throw to trigger the main catch block
// }


        const descriptionCid = await uploadJSONToIPFS({ description });


        console.log("✅ Description uploaded:", descriptionCid);

        // 🖼️ Optional cover image
        let thumbnailCid = "";
        if (coverImage) {
            console.log("🖼️ Uploading cover image...");
            thumbnailCid = await uploadFileToIPFS(coverImage.path);
            console.log("✅ Cover image uploaded:", thumbnailCid);
        }

        // 📦 Construct metadata
        const metadata = {
            title,
            descriptionCid,
            previewCid,
     
            thumbnailCid,
            licenseType,
            blurLevel,
            categories,
            encryptedCid,
        };
        console.log("📦 Constructed metadata:", metadata);

        console.log("🌐 Uploading metadata to IPFS...");
        const metadataCid = await uploadJSONToIPFS(metadata);
        console.log("✅ Metadata uploaded:", metadataCid);

        // 🔗 Upload metadata to smart contract
        console.log("🔗 Connecting to Ethereum provider...");
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log("contractABI:::"+abi);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
        console.log("🔗 Connected to contract:", CONTRACT_ADDRESS);

        // static call


        // const predictedDocId = await contract.callStatic.uploadDocument({
        //     metadataCid,
        //     encryptedCid,
        //     descriptionCid,
        //     previewCid,
        //     thumbnailCid,
        //     title,
        //     categories,
        //     price: ethers.parseEther(price),
        //     uploaderAddress: userWalletAddress
        // });
        // console.log("🆔 Predicted Document ID (from callStatic):", predictedDocId);
        //
        //
        //







        //
        console.log("📤 Uploading document to smart contract...");
        const tx = await contract.uploadDocument({
            metadataCid,
            encryptedCid,
            descriptionCid,
            previewCid,
            thumbnailCid,
            title,
            categories,
            price: ethers.parseEther(price),
            uploaderAddress:userWalletAddress
        });
        // console.log("📨 Transaction sent:", tx.hash);

        // const receipt = await tx.wait();
        // console.log("✅ Transaction confirmed");

        // console.log(">>receipt::",receipt);
/*
        const docId = receipt.events.find(e => e.event === "DocumentUploaded").args.documentId;
        console.log(">>retrved DocID ::",docId);*/



console.log("📤 Transaction sent:", tx.hash);

// Wait for transaction confirmation and get the receipt
const receipt = await tx.wait();
console.log("✅ Transaction confirmed in block", receipt.blockNumber);

// Parse the DocumentUploaded event to get the docId
const event = receipt.logs
.map(log => contract.interface.parseLog(log))
.find(parsedLog => parsedLog?.name === "DocumentUploaded");

if (event) {
    const docId = ethers.toNumber(event.args[0]); // Use ethers.toNumber for safe conversion
    console.log("📌 Document ID received:", docId);
    //key.toString("hex")
    saveAESKey(docId,key.toString("hex"));





} else {
    console.warn("⚠️ No DocumentUploaded event found in transaction");
}






        res.status(200).json({
            message: "Upload successful and registered on-chain.",
            txHash: tx.hash,
            metadataCid,
        });

    } catch (error) {
        console.error("❌ Upload error:", error);
        res.status(500).json({ error: "Upload failed. See server logs." });
    }
};
