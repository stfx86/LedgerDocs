const jwt = require('jsonwebtoken');
const verifySignature = require('../utils/verifySignature');
const { ethers } = require('ethers');


// Load contract ABI (replace with your actual path)
const ledgerDocABI = require("./../../../artifacts/contracts/LedgerDoc.sol/LedgerDoc.json").abi;


// Environment variables (use dotenv in production)
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const PROVIDER_URL = process.env.PROVIDER_URL ;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || 'your-admin-private-key'; // Store securely
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'; // Store securely


// Initialize ethers provider and wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ledgerDocABI, provider);
const contractWithSigner = contract.connect(adminWallet);




exports.login = async (req, res) => {

    try {
    const { address, message, signature } = req.body;
    if (!address || !message || !signature) {
        return res.status(400).json({ error: "Missing fields" });
    }

    // Step 1: Verify signature
    const isValid = await verifySignature(address, message, signature);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
    }



    let user;
    try {
      user = await contract.getUserByAddress(address);
      console.log('User found:', user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle case where user is not registered (e.g., BAD_DATA error)
      if (error.code === 'BAD_DATA' || error.message.includes('User not found')) {
        console.log('User not found, registering...');

        // Step 3: Register user
        try {
          const tx = await contractWithSigner.registerUser(
            address,
            'Default_Name (change me)', // Replace with user-provided or default data
            '', // Replace with actual CID or empty string
            '' // Replace with actual CID or empty string
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


    // Step 5: Issue JWT token
    const token = jwt.sign(
      { address: user.wallet, userId: user.id.toString() },
      JWT_SECRET,
      { expiresIn: '1h' } // Adjust expiration as needed
    );

    res.json({
        token
      });


    
    }
    
    
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
      }








    




    // Issue JWT
    // const token = jwt.sign({ address }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.json({ token });
}; 