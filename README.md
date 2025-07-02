## Requirements
- **Node.js** 
- **MetaMask** (browser extension )
- **Poppler-utils** (a CLI tool for PDF preview generation)
   - **Linux/debian** `sudo apt install poppler-utils`
   - **Windows:**    - Extract the `Release-24.08.0-0.zip` file  
                     - Copy the absolute path of the `poppler-24.08.0/Library/bin/` folder  
                     - Add it to your system's `PATH` environment variable  


##  MetaMask Setup 
   - connet to Holesky testnet 
      - click "add Holesky Test Network" in the bottom of this page "holesky.etherscan.io/"
   - Import an existing account with some faucet to  buy documents  
      - open MetaMask 
      - make sure you are on the Holesky Test Network (you can check in the top left )
      - click "add account " under your accounts 
      - choose "private key"
      - enter   "cf2cfa63751fbe4a5d56ec23736e1ed5fea077d7a7d5412803f3e11bcceefaa9"  as private key
      - click "import"
   - Import the admin account  if you want admin access.
      - same previews steps
      - enter   "af1d426a5c7aa4ace12194ca255c1fee3e82fb4877f114cf20336c5f6642ce4f" as private key 
      - click "import"





## Directory Structure
```
LedgerDocs/
├── backend/                # Express backend API
│   ├── src/                # Source code (routes, controllers, utils)
│   ├── .env                # Environment variables (identical to `.env.test`)
│   └── ...
├── document-ether-market/  # Frontend 
│   ├── src/                # Frontend source code
│   └── ...
├── contracts/              # Solidity smart contracts
│   └── LedgerDoc.sol       # Main contract
├── ignition/               # Hardhat Ignition deployment modules
├── hardhat.config.js       # Hardhat config for contract deployment
└── ...
```



## Environment Variables
**Backend requires a `.env` file in `backend/` (identical to `.env.test`):**
```
PINATA_JWT=...            # Pinata JWT for IPFS uploads
JWT_SECRET=...            # Secret for JWT authentication
ADMIN_PRIVATE_KEY=...     # Ethereum private key for admin actions
PROVIDER_URL=...          # Ethereum RPC URL (e.g., Holesky )
CONTRACT_ADDRESS=...      # Deployed contract address in Holesky 
GEMINI_API_KEY=...        # Gemini API key (optional)
MASTER_KEY=...            # Master AES key (32 chars)
```







## Backend Setup
   cd backend
   npm install
   npm run dev

## Frontend Setup
   cd document-ether-market
   npm install
   npm run dev
   The app runs on [http://localhost:8080]




##  using the app 
- go to http://localhost:8080
- before clicking "connect wallet" open MetaMask and choose the account you wanna connect with 
- click "connect wallet" 
- after conneting you can 
      - Browse and search available documents

      - Buy documents using your connected wallet 

      - Upload documents (if your Poppler-utils is settup properly )

      - Access admin features (if using the admin wallet)

