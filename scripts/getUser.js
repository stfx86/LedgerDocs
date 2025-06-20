    const { ethers } = require("hardhat");

    async function main() {
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address
        const userAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with target wallet

        const LedgerDoc = await ethers.getContractAt("LedgerDoc", contractAddress);
        const user = await LedgerDoc.getUserByAddress(userAddress);


        console.log(user);
    }

    main().catch((error) => {
        console.error("Error:", error);
        process.exitCode = 1;
    });
