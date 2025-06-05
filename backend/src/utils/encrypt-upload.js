const crypto = require("crypto");
const { uploadFileToIPFS } = require("./ipfs");
require("dotenv").config();

/**
 * Encrypts a PDF (file path or buffer) with AES-256-GCM and uploads it to IPFS.
 * @param {Object} config - Configuration object
 * @param {string|Buffer} config.inputPDF - Path to the PDF file or PDF buffer
 * @param {string} [config.pdfFilename] - Filename for buffer input or file (defaults to 'encrypted-pdf-<timestamp>.pdf')
 * @param {number} [config.uploadRetries=2] - Number of retry attempts for IPFS upload
 * @returns {Promise<{ cid: string, key: Buffer, iv: Buffer }>} - IPFS CID, encryption key, and IV
 */

const encryptAndUploadPDF = async({
    inputPDF,
    pdfFilename = `encrypted-pdf-${Date.now()}.pdf`,
    uploadRetries = 3,
}) => {
    // Validate input
    const isBuffer = Buffer.isBuffer(inputPDF);
    const isFilePath = typeof inputPDF === "string";
    if (!isBuffer && !isFilePath) {
        throw new Error("inputPDF must be a file path (string) or Buffer");
    }

    // Read PDF data
    const pdfData = isBuffer ? inputPDF : await require("fs").promises.readFile(inputPDF);
    const filename = isFilePath ? require("path").basename(inputPDF) : pdfFilename;

    // Generate encryption key and IV
    const key = crypto.randomBytes(32); // 256-bit key for AES-256
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM (recommended)

    // Encrypt PDF
    console.log("🔐 Encrypting PDF...");
    const startEncrypt = Date.now();
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = Buffer.concat([cipher.update(pdfData), cipher.final()]);
    const authTag = cipher.getAuthTag(); // GCM authentication tag
    // Concatenate IV, authTag, and encrypted data for decryption
    const encryptedBuffer = Buffer.concat([iv, authTag, encrypted]);
    console.log(`Encryption took ${Date.now() - startEncrypt}ms`);

    // Upload encrypted buffer to IPFS
    for (let attempt = 0; attempt <= uploadRetries; attempt++) {
        try {
            console.log(`Uploading encrypted PDF to IPFS (attempt ${attempt + 1})...`);
            const startUpload = Date.now();
            const cid = await uploadFileToIPFS(encryptedBuffer, filename);
            console.log(`Upload took ${Date.now() - startUpload}ms`);
            console.log(`🚀 Encrypted PDF uploaded to IPFS with CID: ${cid}`);
            return { cid, key, iv }; // Return key and IV for decryption
        } catch (error) {
            console.error(`Upload attempt ${attempt + 1} failed: ${error.message}`);
            if (attempt < uploadRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Retrying after ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw new Error(`Failed to upload encrypted PDF after ${uploadRetries + 1} attempts: ${error.message}`);
            }
        }
    }
};

module.exports = { encryptAndUploadPDF };