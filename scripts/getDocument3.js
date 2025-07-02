const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address

    const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress);
    const doc = await LedgerDoc.getDocument(15);
    

    console.log(">>document ::",doc);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
