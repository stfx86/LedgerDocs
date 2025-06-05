const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execSync } = require("child_process");
const { uploadFileToIPFS, uploadJSONToIPFS } = require("./ipfs");

require("dotenv").config();

/**
 * Creates blurred preview images from a PDF, uploads them to IPFS, and generates a JSON file with the PDF filename and JSON CID.
 * @param {Object} config - Configuration object
 * @param {string} config.inputPDFPath - Path to the input PDF file
 * @param {string} [config.outputJSONPath] - Path for the output JSON file (defaults to 'ipfs_cids.json')
 * @param {string} [config.tempDir] - Temporary directory for image processing (defaults to 'temp_blur')
 * @param {number} [config.patchWidth] - Width of blur patches (uses full image width if not specified)
 * @param {number} [config.patchHeight=80] - Height of blur patches
 * @param {number} [config.blurPercentage=0.5] - Percentage of page to blur (0 to 1)
 * @param {number} [config.blurStrength=15] - Strength of the blur effect
 * @param {number} [config.imageResolution=150] - Resolution for PDF-to-image conversion (DPI)
 * @returns {Promise<Object>} - { outputJSONPath, jsonCID }
 */
const makePreview = async ({
    inputPDFPath,
    outputJSONPath = path.join(__dirname, "ipfs_cids.json"),
    tempDir = path.join(__dirname, "temp_blur"),
    patchWidth,
    patchHeight = 80,
    blurPercentage = 0.5,
    blurStrength = 15,
    imageResolution = 150,
}) => {
    // Validate input
    if (!fs.existsSync(inputPDFPath)) {
        throw new Error(`Input PDF file does not exist: ${inputPDFPath}`);
    }
    if (blurPercentage < 0 || blurPercentage > 1) {
        throw new Error("blurPercentage must be between 0 and 1");
    }
    if (blurStrength <= 0) {
        throw new Error("blurStrength must be greater than 0");
    }
    if (imageResolution <= 0) {
        throw new Error("imageResolution must be greater than 0");
    }

    // Create temporary directory
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    try {
        // Step 1: Convert PDF to images
        console.log("🔄 Converting PDF to images...");
        execSync(`pdftoppm -png -r ${imageResolution} "${inputPDFPath}" "${tempDir}/page"`, { stdio: "inherit" });

        const files = fs.readdirSync(tempDir).filter((f) => f.endsWith(".png"));
        if (files.length === 0) {
            throw new Error("No images generated from PDF");
        }
        console.log(`📄 Found ${files.length} pages`);

        const getRandomPatches = (imgWidth, imgHeight) => {
            const effectivePatchWidth = patchWidth || imgWidth; // Use full width if patchWidth not specified
            const patchArea = effectivePatchWidth * patchHeight;
            const pageArea = imgWidth * imgHeight;
            const patchCount = Math.max(1, Math.floor((pageArea * blurPercentage) / patchArea));

            const patches = [];
            for (let i = 0; i < patchCount; i++) {
                const top = Math.floor(Math.random() * (imgHeight - patchHeight));
                patches.push({
                    left: 0,
                    top,
                    width: effectivePatchWidth,
                    height: patchHeight,
                });
            }
            console.log(`🧩 Generated ${patchCount} patches for image ${imgWidth}x${imgHeight}`);
            return patches;
        };

        const ipfsCIDs = [];

        // Step 2: Process and blur images, then upload to IPFS
        for (const file of files) {
            const inputImg = path.join(tempDir, file);
            console.log(`🖼️ Processing image: ${inputImg}`);

            const image = sharp(inputImg);
            const { width, height } = await image.metadata();
            console.log(`📏 Image dimensions: ${width}x${height}`);

            let base = await image.toBuffer();
            const patches = getRandomPatches(width, height);

            for (const patch of patches) {
                try {
                    const blurred = await sharp(base)
                        .extract(patch)
                        .blur(blurStrength)
                        .toBuffer();

                    base = await sharp(base)
                        .composite([{ input: blurred, left: patch.left, top: patch.top }])
                        .toBuffer();
                } catch (err) {
                    console.error(`Error applying blur to patch: ${err.message}`);
                    throw err;
                }
            }

            await sharp(base).toFile(inputImg); // Overwrite original image with blurred version
            console.log(`🖼️ Blurred image saved: ${inputImg}`);

            // Upload blurred image to IPFS
            console.log("Start--------------------------")
            const cid = await uploadFileToIPFS(inputImg, file); // Use original filename
            console.log("End--------------------------")

            // const cid = "wwwwwwwwwwwwwwwwwwwwww" // Use original filename

            ipfsCIDs.push(cid);
            console.log(`🚀 Uploaded blurred image to IPFS: ${cid}`);
        }

        // Step 3: Create JSON data with filename and CIDs for IPFS upload
        const pdfFilename = path.basename(inputPDFPath);
        const jsonData = {
            file: pdfFilename,
            cids: ipfsCIDs,
            jsonCID: null, // Placeholder, updated after upload
        };

        // Step 4: Upload JSON file to IPFS
        const jsonCID = await uploadJSONToIPFS(jsonData, "ipfs_cids.json");
        console.log("🚀 JSON file uploaded to IPFS with CID:", jsonCID);

        // Step 5: Save JSON with only filename and jsonCID to local file
        const localJsonData = {
            file: pdfFilename,
            jsonCID: jsonCID,
        };
        fs.writeFileSync(outputJSONPath, JSON.stringify(localJsonData, null, 2));
        console.log("📝 JSON with jsonCID saved to:", outputJSONPath);

        // Return results
        return {
            outputJSONPath,
            jsonCID,
        };
    } finally {
        // Step 6: Clean up temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log("🧹 Cleaned up temporary directory");
        }
    }
};

module.exports = { makePreview };