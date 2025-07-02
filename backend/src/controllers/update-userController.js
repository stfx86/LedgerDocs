const { uploadFileToIPFS, uploadJSONToIPFS } = require('../utils/ipfs');
const { ethers } = require('ethers');
// const { LedgerDocAddress, abi } = require('../utils/');


const { abi } = require("../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json");

const  LedgerDocAddress = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;


const update_user = async (req, res) => {
    try {
        const { name, email, about } = req.body;
        const imageFile = req.file; // From multer
        const userWalletAddress = req.user?.address;

        if (!userWalletAddress) {
            return res.status(401).json({ error: 'User wallet address not found' });
        }

        // Upload image to IPFS if provided
        let profileImageCid = '';
        if (imageFile) {
            profileImageCid = await uploadFileToIPFS(imageFile.buffer, imageFile.originalname);
        }

        // Upload email and about as JSON to IPFS
        const profileData = {
            email: email || '',
            about: about || '',
        };
        const profileCid = await uploadJSONToIPFS(profileData, `profile-${userWalletAddress}`);

        // Initialize ethers provider and signer
        const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
        const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(LedgerDocAddress, abi, wallet);

        // Update name on-chain if provided
        if (name) {
            const txName = await contract.updateUserName(name, { from: userWalletAddress });
            await txName.wait();
        }

        // Update profileCid on-chain
        const txProfileCid = await contract.updateProfileCid(profileCid, { from: userWalletAddress });
        await txProfileCid.wait();

        // Update profileImageCid on-chain if image was uploaded
        if (profileImageCid) {
            const txImageCid = await contract.updateProfileImageCid(profileImageCid, { from: userWalletAddress });
            await txImageCid.wait();
        }

        res.status(200).json({ profileCid, profileImageCid });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

module.exports = { update_user };
