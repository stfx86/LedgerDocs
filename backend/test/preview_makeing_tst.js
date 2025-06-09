const { makePreview } = require("./../src/utils/makePreview"); // Corrected import path
const path = require("path");

const generatePreview = async () => {
    try {
        const config = {
            inputPDFPath: path.join(__dirname, "plaining"),
            outputJSONPath: path.join(__dirname, "output/ipfs_cids.json"),
            tempDir: path.join(__dirname, "temp_blur"),
            patchWidth: null, // Use full image width
            patchHeight: 25,//80
            blurPercentage: 0.3,
            blurStrength: 20,
            imageResolution: 300,//100 // Lowered for performance
        };

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

// Run the function and handle the promise
generatePreview()
    .then(() => console.log("Preview generation completed successfully"))
    .catch((err) => console.error("Failed to generate preview:", err.message));
