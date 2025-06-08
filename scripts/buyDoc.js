const { ethers } = require("hardhat");

async function main() {
  const provider = ethers.provider; // Use the Hardhat provider

  const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY_HERE"; // 🛑 NEVER share this in real code
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress, wallet);
  const user = await LedgerDoc.getUserByAddress(userAddress);

  console.log(user);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
