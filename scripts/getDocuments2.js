const { ethers } = require('ethers');
const {}=require(".")

// DocumentData type (simplified for JS)
const fetchMyDocuments = async (contract, userId) => {
    console.log('[fetchMyDocuments] Starting for userId:', userId);
    try {
        console.log('[fetchMyDocuments] Creating DocumentUploaded filter for userId:', userId);
        const filter = contract.filters.DocumentUploaded(null, userId);
        console.log('[fetchMyDocuments] Querying events with filter');
        const events = await contract.queryFilter(filter);
        console.log('[fetchMyDocuments] Retrieved events:', events.length);

        const documents = [];
        for (const event of events) {
            // console.log('[fetchMyDocuments] Processing event:', event);
            if (!event.args) {
                console.log('[fetchMyDocuments] Skipping event with no args');
                continue;
            }

            const docId = Number(event.args.documentId);
            console.log('[fetchMyDocuments] Fetching document for docId:', docId);
            const doc = await contract.getDocument(docId);
            console.log('[fetchMyDocuments] Document data:', doc);

            if (doc.status !== 0) {
                console.log('[fetchMyDocuments] Skipping removed document, docId:', docId);
                continue;
            }

            console.log('[fetchMyDocuments] Fetching sales for userId:', userId);
            const sales = await contract.getUserSales(userId);
            console.log('[fetchMyDocuments] Sales retrieved:', sales);
            const docSales = sales.filter(sale => Number(sale.documentId) === docId).length;
            console.log('[fetchMyDocuments] Document sales count for docId:', docId, 'is', docSales);

            const price = BigInt(doc.price);
            console.log('[fetchMyDocuments] Document price (wei):', doc.price, 'as BigInt:', price);
            const earnings = (price * BigInt(docSales)) / BigInt(10 ** 18);
            console.log('[fetchMyDocuments] Calculated earnings (wei):', earnings);

            documents.push({
                id: docId,
                title: event.args.title,
                price: ethers.formatEther(price),
                           sales: docSales,
                           earnings: ethers.formatEther(earnings),
                           views: 0,
                           status: 'active',
            });
            console.log('[fetchMyDocuments] Added document to result:', documents[documents.length - 1]);
        }

        console.log('[fetchMyDocuments] Final documents array:', documents);
        return documents;
    } catch (error) {
        console.error('[fetchMyDocuments] Error fetching documents:', error);
        return [];
    }
};

// Minimal ABI
const ledgerDocAbi = [
    'event DocumentUploaded(uint256 indexed documentId, uint256 indexed uploaderId, string title, string[] categories, uint256 indexed price, uint256 uploadTime, string metadataCid, string encryptedCid, string descriptionCid, string previewCid, string thumbnailCid, string uploaderName)',
    'function getDocument(uint256 docId) view returns (uint256 id, string metadataCid, string encryptedCid, string descriptionCid, string previewCid, string thumbnailCid, string title, string[] categories, uint256 price, uint256 downloads, uint256 totalRating, uint256 ratingCount, uint256 uploaderId, uint256 uploadTime, uint8 status)',
    'function getUserSales(uint256 userId) view returns (tuple(uint256 documentId, uint256 timestamp)[])',
];

// Test function
async function testFetchMyDocuments() {
    const providerUrl = 'http://localhost:8545'; // e.g., 'http://localhost:8545' or Infura/Alchemy URL
    const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3'; // Your LedgerDoc contract address
    const userId = 1; // Replace with a valid userId

    console.log('[testFetchMyDocuments] Starting with:', { providerUrl, contractAddress, userId });

    try {
        const provider = new ethers.JsonRpcProvider(providerUrl);
        console.log('[testFetchMyDocuments] Provider initialized');
        const contract = new ethers.Contract(contractAddress, ledgerDocAbi, provider);
        console.log('[testFetchMyDocuments] Contract initialized:', contract.address);

        const documents = await fetchMyDocuments(contract, userId);
        console.log('[testFetchMyDocuments] Result:', documents);
    } catch (error) {
        console.error('[testFetchMyDocuments] Error:', error);
    }
}

// Run the test
testFetchMyDocuments();
