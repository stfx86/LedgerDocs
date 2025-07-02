const { uploadFileToIPFS, uploadJSONToIPFS } = require('../utils/ipfs');
const { ethers } = require('ethers');
const { NonceManager } = require('ethers');

const { abi } = require("../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json");

const LedgerDocAddress = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const signer = new NonceManager(wallet);
const contract = new ethers.Contract(LedgerDocAddress, abi, signer);

const update_user = async (req, res) => {
    console.log("the signer::", signer);

    console.log("update_user hit .....................");
    try {
        const { name, email, about } = req.body;
        const imageFile = req.file; // From multer
        const userWalletAddress = req.user?.address;

        if (!userWalletAddress) {
            return res.status(401).json({ error: 'User wallet address not found' });
        }

        // Upload image to IPFS if provided
        console.log("imageFile::", imageFile);
        let profileImageCid = '';
        if (imageFile) {
            profileImageCid = await uploadFileToIPFS(imageFile.path, imageFile.originalname);
        }

        // Upload email and about as JSON to IPFS
        const profileData = {
            email: email || '',
            about: about || '',
        };
        const profileCid = await uploadJSONToIPFS(profileData, `profile-${userWalletAddress}`);

        // Update name on-chain if provided
        if (name) {
            const txName = await contract.updateUserName(userWalletAddress, name);
            console.log("the name::", name);
            await txName.wait();
            console.log("txName.wait(); hash::", txName.hash);
        }

        // Update profileCid on-chain
        const txProfileCid = await contract.updateProfileCid(userWalletAddress, profileCid);
        await txProfileCid.wait();
        console.log("txProfileCid.wait(); hash::", txProfileCid.hash);

        // Update profileImageCid on-chain if image was uploaded
        console.log("profileImageCid:", profileImageCid);
        if (profileImageCid) {
            const txImageCid = await contract.updateProfileImageCid(userWalletAddress, profileImageCid);
            await txImageCid.wait();
            console.log("txImageCid.wait();", txImageCid.hash);
        }

        // console.log()
        res.status(200).json({ profileCid, profileImageCid });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

module.exports = { update_user };
