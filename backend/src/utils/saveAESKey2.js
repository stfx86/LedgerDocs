require("dotenv").config();
const crypto = require("crypto");
const { ethers } = require("ethers");
const { uploadJSONToIPFS } = require("./ipfs"); // path to your module
const LedgerDocABI = require("../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json").abi; 

// Load from .env
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const PROVIDER_URL = process.env.PROVIDER_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const MASTER_KEY = process.env.MASTER_KEY; // 32 bytes

// Encrypt AES key using AES-256-CBC
function encryptAESKey(aesKeyHex, masterKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(masterKey), iv);
    const encrypted = Buffer.concat([
        cipher.update(Buffer.from(aesKeyHex, "hex")),
        cipher.final()
    ]);
    return {
        encryptedAESKey: encrypted.toString("hex"),
        iv: iv.toString("hex")
    };
}

/**
 * Encrypt and upload AES key to IPFS, then register CID on-chain.
 * @param {number} docId - Document ID
 * @param {string} aesKeyHex - AES key in hex format
 */
async function saveAESKey(docId, aesKeyHex) {
    try {
        // Step 1: Encrypt the AES key
        const { encryptedAESKey, iv } = encryptAESKey(aesKeyHex, MASTER_KEY);

        // Step 2: Upload encrypted key JSON to IPFS via Pinata
        const payload = { id: docId, encryptedAESKey, iv };
        const cid = await uploadJSONToIPFS(payload, `doc-${docId}-aeskey`);
        console.log(`✅ Uploaded encrypted key to IPFS. CID: ${cid}`);

        // Step 3: Connect to contract and set CID on-chain
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, LedgerDocABI, wallet);

        const tx = await contract.setDecryptionKeyCID(docId, cid);
        await tx.wait();

        console.log(`✅ CID registered on-chain for docId ${docId}`);
    } catch (err) {
        console.error("❌ Failed to save AES key:", err);
    }
}

module.exports = { saveAESKey };
