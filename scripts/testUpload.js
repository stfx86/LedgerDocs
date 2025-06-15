import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    // Contract + signer config
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Deployed contract
    const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat default key

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Local Hardhat node
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress, signer);

    // Dummy/mock data
    const metadataCid = "QmU4vfHV6CL3Sx4DMZ5LbzPqtGChyxL9wMD8nDCwYqN8E5";
    const encryptedCid = "QmYLqmNYptUPXRss13x1sgrc1BcZoqzA9DBKf8fi4MEHBv";
    const descriptionCid = "QmSomeDescCID";
    const previewCid = "QmPreviewCID";
    const thumbnailCid = "QmThumbnailCID";
    const title = "Test Document";
    const categories = ["design"];
    const price = ethers.parseEther("0.1"); // 0.1 ETH
    const uploaderAddress = signer.address;

    console.log("📝 Uploading document as:", uploaderAddress);

    // Send the transaction
    const tx = await LedgerDoc.uploadDocument({
        metadataCid,
        encryptedCid,
        descriptionCid,
        previewCid,
        thumbnailCid,
        title,
        categories,
        price,
        uploaderAddress
    });

    console.log("📤 Transaction sent:", tx.hash);

    // Wait for transaction confirmation and get the receipt
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block", receipt.blockNumber);

    // Parse the DocumentUploaded event to get the docId
    const event = receipt.logs
    .map(log => LedgerDoc.interface.parseLog(log))
    .find(parsedLog => parsedLog?.name === "DocumentUploaded");

    if (event) {
        const docId = ethers.toNumber(event.args[0]); // Use ethers.toNumber for safe conversion
        console.log("📌 Document ID received:", docId);
    } else {
        console.warn("⚠️ No DocumentUploaded event found in transaction");
    }
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});
