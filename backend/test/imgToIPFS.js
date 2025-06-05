const path = require('path');
const { uploadFileToIPFS } = require('./../src/utils/ipfs');

(async () => {
    try {
        const imagePath = path.join(__dirname, 'blurred_page-1.png'); // Replace with your image path
        const ipfsHash = await uploadFileToIPFS(imagePath, 'my-cool-image');
        console.log('Image uploaded to IPFS with CID:', ipfsHash);
    } catch (error) {
        console.error('Upload failed:', error.message);
    }
})();
