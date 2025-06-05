const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address




    const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress);
  console.log(`Listening for DocumentUploaded events on contract at ${contractAddress}...`);

    // Set up the event listener
    LedgerDoc.on("DocumentUploaded", (
        documentId,
        uploaderId,
        title,
        categories,
        price,
        uploadTime,
        metadataCid,
        encryptedCid,
        descriptionCid,
        previewCid,
        thumbnailCid,
        uploaderName,

    ) => {
        console.log("DocumentUploaded event received:");
        console.log({
            documentId: documentId.toString(),
            uploaderId: uploaderId.toString(),
            title,
            categories,
            price: ethers.formatEther(price), // Assuming price is in wei
            uploadTime: new Date(Number(uploadTime) * 1000).toISOString(), // Convert timestamp to readable format
            metadataCid,
            encryptedCid,
            descriptionCid,
            previewCid,
            thumbnailCid,
            uploaderName,

        });
    });




    // Optional: Listener for DocumentCategoryTagged event (to capture related events)
    LedgerDoc.on("DocumentCategoryTagged", (documentId, category, event) => {
        console.log("DocumentCategoryTagged event received:");
        console.log({
            documentId: documentId.toString(),
                    category, // Now a string due to non-indexed change in contract
                    transactionHash: event.transactionHash
        });
    });




    // UserRegistered
    LedgerDoc.on("UserRegistered", (userId, wallet, name, profileCid, profileImageCid, joinedAt, event) => {
        console.log("UserRegistered event received:");
        console.log({
            userId: userId.toString(),
                    wallet,
                    name: name._isIndexed ? name.hash : name,
                    profileCid,
                    profileImageCid,
                    joinedAt: new Date(Number(joinedAt) * 1000).toISOString(),
                    transactionHash: event.transactionHash
        });
    });




    // AuthorizationUpdated
    LedgerDoc.on("AuthorizationUpdated", (uploader, status, event) => {
        console.log("AuthorizationUpdated event received:");
        console.log({
            uploader,
            status,
            transactionHash: event.transactionHash
        });
    });

    // DocumentRemoved
    LedgerDoc.on("DocumentRemoved", (documentId, event) => {
        console.log("DocumentRemoved event received:");
        console.log({
            documentId: documentId.toString(),
                    transactionHash: event.transactionHash
        });
    });




    // UserStatusUpdated
    LedgerDoc.on("UserStatusUpdated", (userId, status, event) => {
        console.log("UserStatusUpdated event received:");
        console.log({
            userId: userId.toString(),
                    status: status === 0 ? "Active" : "Suspended",
                    transactionHash: event.transactionHash
        });
    });

    // DocumentPurchased
    LedgerDoc.on("DocumentPurchased", (documentId, buyerId, timestamp, event) => {
        console.log("DocumentPurchased event received:");
        console.log({
            documentId: documentId.toString(),
                    buyerId: buyerId.toString(),
                    timestamp: new Date(Number(timestamp) * 1000).toISOString(),
                    transactionHash: event.transactionHash
        });
    });





}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
