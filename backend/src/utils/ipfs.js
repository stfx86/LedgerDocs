
const pinataSDK = require('@pinata/sdk');
const { Readable } = require('stream');
const fs = require('fs');
require('dotenv').config();

// Check for required environment variables
if (!process.env.PINATA_JWT) {
    throw new Error('PINATA_JWT environment variable is required');
}

// Initialize Pinata with JWT
const pinata = new pinataSDK({
    pinataJWTKey: process.env.PINATA_JWT,
});

/**
 * Upload JSON data to IPFS
 * @param {Object} data - The JSON data to upload
 * @param {string} [filename] - Optional filename for metadata
 * @returns {Promise<string>} - The IPFS CID
 */
const uploadJSONToIPFS = async (data, filename = null) => {
    try {
        const options = filename ? { pinataMetadata: { name: filename } } : {};
        const result = await pinata.pinJSONToIPFS(data, options);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error);
        throw new Error('Failed to upload JSON to IPFS');
    }
};

/**
 * Upload file to IPFS
 * @param {string | Buffer} input - File path (string) or Buffer
 * @param {string} [filename] - Optional filename for the file
 * @returns {Promise<string>} - The IPFS CID
 */
const uploadFileToIPFS = async (input, filename = null) => {
    try {
        let readableStream;
        if (typeof input === 'string') {
            // Input is a file path
            readableStream = fs.createReadStream(input);
        } else if (Buffer.isBuffer(input)) {
            // Input is a Buffer
            readableStream = new Readable();
            readableStream.push(input);
            readableStream.push(null);
        } else {
            throw new Error('Input must be a file path (string) or Buffer');
        }

        // Ensure filename is provided; fallback to a default if null
        const metadataName = filename || `file-${Date.now()}`;
        const options = { pinataMetadata: { name: metadataName } };
        const result = await pinata.pinFileToIPFS(readableStream, options);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        throw new Error('Failed to upload file to IPFS');
    }
};


module.exports = {
    uploadJSONToIPFS,
    uploadFileToIPFS,
};
