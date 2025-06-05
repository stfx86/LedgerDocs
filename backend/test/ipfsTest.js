const { uploadFileToIPFS } = require('./../src/utils/ipfs'); // Adjust path to your file
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Helper function to create test files
function createTestFiles() {
    // Create a simple text file
    const textContent = `This is a test file created at ${new Date().toISOString()}
Line 2: Testing file upload to IPFS
Line 3: Hello from Node.js!`;
    
    fs.writeFileSync('test-file.txt', textContent);
    
    // Create a simple JSON file
    const jsonContent = {
        message: "Test JSON file",
        timestamp: new Date().toISOString(),
        data: [1, 2, 3, 4, 5]
    };
    
    fs.writeFileSync('test-data.json', JSON.stringify(jsonContent, null, 2));
    
    console.log('✅ Test files created: test-file.txt, test-data.json');
}

// Test function
async function testUploadFile() {
    console.log('Testing uploadFileToIPFS function...\n');

    // Create test files first
    createTestFiles();

    try {
        // Test 1: Upload text file using file path
        console.log('Test 1: Uploading text file using file path...');
        const cid1 = await uploadFileToIPFS('test-file.txt', 'my-test-file.txt');
        console.log('✅ Success! IPFS CID:', cid1);
        console.log('Access URL: https://gateway.pinata.cloud/ipfs/' + cid1);
        console.log();

        // Test 2: Upload JSON file using file path (no custom filename)
        console.log('Test 2: Uploading JSON file using file path (auto filename)...');
        const cid2 = await uploadFileToIPFS('test-data.json');
        console.log('✅ Success! IPFS CID:', cid2);
        console.log('Access URL: https://gateway.pinata.cloud/ipfs/' + cid2);
        console.log();

        // Test 3: Upload using Buffer
        console.log('Test 3: Uploading file using Buffer...');
        const fileBuffer = fs.readFileSync('test-file.txt');
        const cid3 = await uploadFileToIPFS(fileBuffer, 'buffer-upload.txt');
        console.log('✅ Success! IPFS CID:', cid3);
        console.log('Access URL: https://gateway.pinata.cloud/ipfs/' + cid3);
        console.log();

        // Test 4: Upload text content as Buffer
        console.log('Test 4: Uploading text content directly as Buffer...');
        const textBuffer = Buffer.from('Hello IPFS! This is direct text content.', 'utf8');
        const cid4 = await uploadFileToIPFS(textBuffer, 'direct-text.txt');
        console.log('✅ Success! IPFS CID:', cid4);
        console.log('Access URL: https://gateway.pinata.cloud/ipfs/' + cid4);
        console.log();

        console.log('🎉 All file upload tests completed successfully!');
        
        // Cleanup test files
        fs.unlinkSync('test-file.txt');
        fs.unlinkSync('test-data.json');
        console.log('🧹 Test files cleaned up');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Cleanup on error
        try {
            fs.unlinkSync('test-file.txt');
            fs.unlinkSync('test-data.json');
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        
        process.exit(1);
    }
}

// Run the test
testUploadFile().catch(console.error);