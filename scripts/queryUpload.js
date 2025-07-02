const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
  const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress);

  // Fetch all past DocumentUploaded events
  const events = await LedgerDoc.queryFilter("DocumentUploaded", 0, "latest");

  if (events.length === 0) {
    console.log("No DocumentUploaded events found.");
    return;
  }

  const firstEvent = events[0];
  console.log("First DocumentUploaded event:");
  console.log({
    blockNumber: firstEvent.blockNumber,
    documentId: firstEvent.args.documentId.toString(),
    title: firstEvent.args.title,
    transactionHash: firstEvent.transactionHash
  });
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
