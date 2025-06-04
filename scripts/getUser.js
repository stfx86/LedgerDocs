const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address
    const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with target wallet

    const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress);
    const user = await LedgerDoc.getUserByAddress(userAddress);

    console.log({
        id: user.id.toString(),
        wallet: user.wallet,
        name: user.name,
        profileCid: user.profileCid,
    });
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
