const { ethers } = require('ethers');

async function verifySignature(address, message, signature) {
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (err) {
        return false;
    }
}

module.exports = verifySignature; 