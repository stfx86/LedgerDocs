const { encryptAndUploadPDF } = require('../src/utils/encrypt-upload');

// Run tests
async function runTests() {
    console.log('🧪 Starting encryption tests...\n');

    try {
        // Test 1: Encrypt using file path
        console.log('📝 Test 1: Encrypting using file path...');
        const result1 = await encryptAndUploadPDF({
            inputPDF: './test/plaining',  // Replace with your PDF filename
            pdfFilename: 'test-encrypted.pdf'
        });
        console.log('✅ Test 1 passed:', result1);

        // Test 2: Encrypt using buffer
        console.log('\n📝 Test 2: Encrypting using buffer...');
        const buffer = require('fs').readFileSync('./test/plaining');
        const result2 = await encryptAndUploadPDF({
            inputPDF: buffer,
            pdfFilename: 'test-encrypted-buffer.pdf'
        });
        console.log('✅ Test 2 passed:', result2);
        console.log("key ::",result2.key.toString("hex"));

    } catch (error) {
        console.error('❌ Tests failed:', error);
    }
}

// Run the tests
runTests();