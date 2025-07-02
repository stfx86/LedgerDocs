const { ethers } = require('ethers');
const { abi } = require('../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json');
const { getAESKey } = require('../utils/getAESKey2');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// Provider and signer setup
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

exports.getDecryptionKey = async (req, res) => {
  try {
    const user = req.user; // Comes from authenticateJWT
    const userAddress = user.wallet || user.address;
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required.' });
    }

    console.log(`[getDecryptionKey] Request for docId=${documentId} by ${userAddress}`);

    // 1. Fetch document
    const document = await contract.getDocument(documentId);

    // if (!document || Number(document.status) !== 0) {
    //   return res.status(404).json({ error: 'Document not found or removed.' });
    // }

    if (!document ) {
      return res.status(404).json({ error: 'Document not found or removed.' });
    }


    // 2. Get userId
    const userInfo = await contract.getUserByAddress(userAddress);
    const userId = Number(userInfo.id);

    // 3. Check uploader
    const isUploader = Number(document.uploaderId) === userId;

    // 4. Check if authorized
    const isAuthorized = await contract.isAuthorized(userAddress);

    // 5. Check if purchased
    const purchases = await contract.getUserPurchases(userId);
    const hasPurchased = purchases.some(p => Number(p.documentId) === Number(documentId));

    console.log(
      "isUploader:",isUploader, "\nisAuthorized:",isAuthorized,"\n hasPurchased:",hasPurchased)
      
    // 6. Access control
    if (!isUploader && !isAuthorized && !hasPurchased) {
      return res.status(403).json({ error: 'Access denied: you do not have permission to access this document.' });
    }

    // 7. Fetch AES key
    const key = await getAESKey(documentId);
    if (!key) {
      return res.status(404).json({ error: 'Decryption key not found for this document.' });
    }

    return res.status(200).json({ key });

  } catch (error) {
    console.error('[getDecryptionKey] Error:', error);
    return res.status(500).json({ error: 'Server error while retrieving decryption key.' });
  }
};
