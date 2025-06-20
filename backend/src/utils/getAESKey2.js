require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { ethers } = require("ethers");
const LedgerDocABI = require("../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json").abi; // ABI of your LedgerDoc contract

const PROVIDER_URL = process.env.PROVIDER_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const MASTER_KEY = process.env.MASTER_KEY;

/**
 * Decrypt AES key using AES-256-CBC
 */
function decryptAESKey(ciphertextHex, ivHex, masterKey) {
    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(masterKey),
        Buffer.from(ivHex, "hex")
    );
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(ciphertextHex, "hex")),
        decipher.final()
    ]);
    return decrypted.toString("hex");
}

/**
 * Retrieve and decrypt AES key from IPFS using on-chain CID.
 * @param {number} docId - Document ID
 * @returns {Promise<string|null>} - AES key in hex format
 */
async function getAESKey(docId) {
    try {
        // Step 1: Connect to contract and get CID
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LedgerDocABI, provider);

        const cid = await contract.getDecryptionKeyCID(docId);
        if (!cid || cid === "") {
            console.warn(`⚠️ No CID found on-chain for docId ${docId}`);
            return null;
        }

        // Step 2: Fetch encrypted key from IPFS (Pinata gateway)
        const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const res = await axios.get(url);
        const { encryptedAESKey, iv } = res.data;

        // Step 3: Decrypt AES key
        const aesKeyHex = decryptAESKey(encryptedAESKey, iv, MASTER_KEY);
        return aesKeyHex;
    } catch (error) {
        console.error(`❌ Error retrieving AES key for docId ${docId}:`, error.message);
        return null;
    }
}

module.exports = { getAESKey };
