const { encryptAndUploadPDF } = require("../src/utils/encrypt-upload");
const fs = require("fs").promises;
const path = require("path");

const testEncryptAndUpload = async () => {
    try {
        // Test 1: Buffer input
        console.log("=== Testing with Buffer Input ===");
        const pdfBuffer = await fs.readFile(path.join(__dirname, "p.pdf"));
        const bufferConfig = {
            inputPDF: pdfBuffer,
            pdfFilename: "encrypted-sample.pdf",
            uploadRetries: 3,
        };

        console.log("Starting encryption and upload with buffer config:", bufferConfig);
        const startBuffer = Date.now();
        const bufferResult = await encryptAndUploadPDF(bufferConfig);
        console.log(`Buffer test completed in ${Date.now() - startBuffer}ms`);
        console.log("Buffer Result:", {
            cid: bufferResult.cid,
            key: bufferResult.key.toString("hex"),
            iv: bufferResult.iv.toString("hex"),
        });

        // Test 2: File path input
        console.log("\n=== Testing with File Path Input ===");
        const fileConfig = {
            inputPDF: path.join(__dirname, "p.pdf"),
            uploadRetries: 2,
        };

        console.log("Starting encryption and upload with file config:", fileConfig);
        const startFile = Date.now();
        const fileResult = await encryptAndUploadPDF(fileConfig);
        console.log(`File test completed in ${Date.now() - startFile}ms`);
        console.log("File Result:", {
            cid: fileResult.cid,
            key: fileResult.key.toString("hex"),
            iv: fileResult.iv.toString("hex"),
        });

        return { bufferResult, fileResult };
    } catch (error) {
        console.error("Test failed:", error.message);
        throw error;
    }
};

testEncryptAndUpload()
    .then(() => console.log("All tests completed successfully"))
    .catch((err) => console.error("Tests failed:", err.message));