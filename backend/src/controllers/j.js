const express = require('express');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Load contract ABI (replace with your actual path)
const ledgerDocABI = require('./../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json').abi;

// Environment variables (use dotenv in production)
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const PROVIDER_URL = 'http://localhost:8545';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || 'your-admin-private-key'; // Store securely
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'; // Store securely

// Initialize ethers provider and wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ledgerDocABI, provider);
const contractWithSigner = contract.connect(adminWallet);

router.post('/login', async (req, res) =>
    
    
    {
  try {
    const { address, message, signature } = req.body;

    // Step 1: Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Step 2: Check if user is registered
    let user;
    try {
      user = await contract.getUserByAddress(address);
      console.log('User found:', user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle case where user is not registered (e.g., BAD_DATA error)
      if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
        console.log('User not found, registering...');

        // Step 3: Register user
        try {
          const tx = await contractWithSigner.registerUser(
            address,
            'Default Name', // Replace with user-provided or default data
            'defaultProfileCid', // Replace with actual CID or empty string
            'defaultProfileImageCid' // Replace with actual CID or empty string
          );
          console.log('Registration transaction:', tx.hash);
          await tx.wait();
          console.log('User registered successfully');

          // Fetch user data after registration
          user = await contract.getUserByAddress(address);
          console.log('User after registration:', user);
        } catch (regError) {
          console.error('Registration failed:', regError);
          return res.status(500).json({ error: 'Failed to register user' });
        }
      } else {
        console.error('Unexpected contract error:', error);
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }
    }

    // Step 4: Create user object
    const userData = {
      id: Number(user.id),
      wallet: user.wallet,
      name: user.name,
      profileCid: user.profileCid,
      profileImageCid: user.profileImageCid,
      joinedAt: Number(user.joinedAt),
    };

    // Step 5: Issue JWT token
    const token = jwt.sign(
      { address: userData.wallet, userId: userData.id },
      JWT_SECRET,
      { expiresIn: '1h' } // Adjust expiration as needed
    );

    // Step 6: Return user data and token
    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}




);

module.exports = router;