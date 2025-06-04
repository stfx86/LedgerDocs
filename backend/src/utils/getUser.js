// Mock user database (replace with real DB in production)
const users = [
    // Example user
    {
        id: 1,
        wallet: "0x1234567890abcdef1234567890abcdef12345678",
        name: "Alex Chen",
        profileCid: "QmExampleProfileCid"
    }
    // Add more users as needed
];

function getUser(address) {
    return users.find(user => user.wallet.toLowerCase() === address.toLowerCase()) || null;
}

module.exports = getUser; 