    const { ethers } = require("hardhat");

    async function main() {
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address
        const userAddress = "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec".toLocaleLowerCase(); // Replace with target wallet

        const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress);
        const user = await LedgerDoc.getUserByAddress(userAddress);


        console.log(user);
    }

    main().catch((error) => {
        console.error("Error:", error);
        process.exitCode = 1;
    });
