const { makePreview } = require("../src/utils/makePreview");
const path = require("path");
const fs = require("fs").promises;

const generatePreview = async () => {
    try {
        // Example: Buffer input (suitable for form uploads)
        const pdfBuffer = await fs.readFile(path.join(__dirname, "p.pdf"));
        const config = {
            inputPDFPath: pdfBuffer,
            pdfFilename: "input.pdf",
            outputJSONPath: path.join(__dirname, "output/ipfs_cids.json"),
            tempDir: path.join(__dirname, "temp_blur"),
            patchWidth: null,
            patchHeight: 80,
            blurPercentage: 0.6,
            blurStrength: 20,
            imageResolution: 100,
            uploadBatchSize: 5,
            uploadRetries: 2,
        };

        // Example: File path input (uncomment to use)
        /*
        const config = {
            inputPDFPath: path.join(__dirname, "2ITE-2-HANSAL-KHABBACHI-MERJANE-VF-1.pdf"),
            outputJSONPath: path.join(__dirname, "output/ipfs_cids.json"),
            tempDir: path.join(__dirname, "temp_blur"),
            patchWidth: null,
            patchHeight: 80,
            blurPercentage: 0.6,
            blurStrength: 20,
            imageResolution: 100,
            uploadBatchSize: 5,
            uploadRetries: 2,
        };
        */

        console.log("Starting preview generation with config:", config);
        const start = Date.now();
        const result = await makePreview(config);
        console.log(`Preview generation completed in ${Date.now() - start}ms`);
        console.log("Result:", result);
        return result;
    } catch (error) {
        console.error("Error generating preview:", error.message);
        throw error;
    }
};

generatePreview()
    .then(() => console.log("Preview generation completed successfully"))
    .catch((err) => console.error("Failed to generate preview:", err.message));