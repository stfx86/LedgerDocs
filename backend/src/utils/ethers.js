const { ethers } = require('ethers');

const getFirstSigner = async () => {
    // Connect to local Hardhat network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Get the first account (signer)
    const signers = await provider.listAccounts();
    const firstSigner = new ethers.Wallet(signers[0], provider);
    
    return firstSigner;
};

module.exports = {
    getFirstSigner
}; 