// scripts/TestLedgerDoc.js
const { ethers } = require("hardhat");
const { saveAESKey } = require("../backend/src/utils/saveAESKey2");

const TEMPLATE_ENCRYPTED_CID = "QmUoydnWM54eHsQ6v62eP7jBa3fk85QK8DmJMLxctuUJdD";
const TEMPLATE_DESCRIPTION_CID = "QmXb87nbHzHMkK4YNmDQLjoEYigVK4fGrtcufRdQS3pDZC";
const TEMPLATE_PREVIEW_CID = "QmUgbquXQQ2xEu3H2c6mbBVkH31kxCZmVKRRvFkE3TRewb";
const TEMPLATE_THUMBNAIL_CID = "QmZiUjiyCXBnpjx4srPkqwzqfqzUiwpYMbzcvnibCvhKKX";
const TEMPLATE_DECRYPTION_KEY_CID = "QmExampleDecryptionKeyCIDFromTemplateDoc";

async function main() {
    const [uploader] = await ethers.getSigners();
    console.log("Uploader address:", uploader.address);

    // Attach to the deployed LedgerDoc contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const LedgerDoc = await ethers.getContractFactory("LedgerDoc");
    const ledgerDoc = LedgerDoc.attach(contractAddress);

    // Register uploader user
    console.log("Checking if uploader user is registered...");
    try {
        const txRegister = await ledgerDoc.registerUser({
            wallet: uploader.address,
            name: "stofy",
            profileCid: "",
            profileImageCid: "bafkreihf6po3ewad2uqgarmmclykd2nqiqmzkecq6hegi55bppg4c5uz64",
        });
        await txRegister.wait();
        console.log("Uploader user registered.");
    } catch (error) {
        if (error.reason === "User exists") {
            console.log("Uploader user already registered, skipping registration.");
        } else {
            throw error;
        }
    }

    // One existing document
    const existingDocuments = [
        {
            title: "Test Document - Teleo-reactive Programming",
            categories: ["cs.PL"],
            price: ethers.parseEther("0.001"), // Fixed: Use ethers.utils.parseEther
            metadataCid: "QmXCATUtuDRFUzeiK36g2EVspaDfpk62oEcxeWArMfPq7Y",
            encryptedCid: "QmUoydnWM54eHsQ6v62eP7jBa3fk85QK8DmJMLxctuUJdD",
            descriptionCid: "QmXb87nbHzHMkK4YNmDQLjoEYigVK4fGrtcufRdQS3pDZC",
            previewCid: "QmUgbquXQQ2xEu3H2c6mbBVkH31kxCZmVKRRvFkE3TRewb",
            thumbnailCid: "QmZiUjiyCXBnpjx4srPkqwzqfqzUiwpYMbzcvnibCvhKKX",
            decryptionKeyCid: "bafkreibchbcovquqwt4z3tshwar36xcpbuwmzgy2ocrrb6ntq6cypseqfe",
        },
    ];

    // One new document
    const newDocuments = [
        {
            title: "Test Web3 Development Guide",
            categories: ["Education", "Code"],
            price: ethers.parseEther("0.05"), // Fixed: Use ethers.utils.parseEther
            metadataCid: "QmXXS7aQTCeQcv6E5k3AZ7L2wefKYXyXKiZy7xvAy4mwRg",
        },
    ];

    let docIdCounter = 0;

    // Upload existing document
    for (const doc of existingDocuments) {
        docIdCounter++;
        console.log(`Uploading existing document #${docIdCounter}: ${doc.title}`);

        const tx = await ledgerDoc.uploadDocument({
            metadataCid: doc.metadataCid,
            encryptedCid: doc.encryptedCid,
            descriptionCid: doc.descriptionCid,
            previewCid: doc.previewCid,
            thumbnailCid: doc.thumbnailCid,
            title: doc.title,
            categories: doc.categories,
            price: doc.price,
            uploaderAddress: uploader.address,
        });
        await tx.wait();

        await saveAESKey(docIdCounter, doc.decryptionKeyCid);
        console.log(`Saved AES key CID for document ID ${docIdCounter}`);
    }

    // Upload new document with template encryption data
    for (const doc of newDocuments) {
        docIdCounter++;
        console.log(`Uploading new document #${docIdCounter}: ${doc.title}`);

        const tx = await ledgerDoc.uploadDocument({
            metadataCid: doc.metadataCid,
            encryptedCid: TEMPLATE_ENCRYPTED_CID,
            descriptionCid: TEMPLATE_DESCRIPTION_CID,
            previewCid: TEMPLATE_PREVIEW_CID,
            thumbnailCid: TEMPLATE_THUMBNAIL_CID,
            title: doc.title,
            categories: doc.categories,
            price: doc.price,
            uploaderAddress: uploader.address,
        });
        await tx.wait();

        await saveAESKey(docIdCounter, TEMPLATE_DECRYPTION_KEY_CID);
        console.log(`Saved AES key CID for document ID ${docIdCounter}`);
    }

    console.log("Test documents uploaded and AES keys saved.");
}

main()
.then(() => process.exit(0))
.catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
