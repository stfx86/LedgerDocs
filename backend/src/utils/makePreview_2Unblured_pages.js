const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");
const { execSync } = require("child_process");
const { uploadFileToIPFS, uploadJSONToIPFS } = require("./ipfs");

require("dotenv").config();

/**
 * Creates blurred preview images from a PDF, uploads them to IPFS in-memory, and appends to a JSON file with the PDF filename and JSON CID.
 * IPFS JSON contains a simple list of CIDs. Fault-tolerant with batched uploads and retries.
 * @param {Object} config - Configuration object
 * @param {string} config.inputPDFPath - Path to the input PDF file
 * @param {string} [config.outputJSONPath] - Path for the output JSON file (defaults to 'ipfs_cids.json')
 * @param {string} [config.tempDir] - Temporary directory for image processing (defaults to 'temp_blur')
 * @param {number} [config.patchWidth] - Width of blur patches (uses full image width if not specified)
 * @param {number} [config.patchHeight=80] - Height of blur patches
 * @param {number} [config.blurPercentage=0.5] - Percentage of page to blur (0 to 1)
 * @param {number} [config.blurStrength=15] - Strength of the blur effect
 * @param {number} [config.imageResolution=72] - Resolution for PDF-to-image conversion (DPI)
 * @param {number} [config.uploadBatchSize=5] - Number of concurrent IPFS uploads
 * @param {number} [config.uploadRetries=2] - Number of retry attempts for failed uploads
 * @returns {Promise<Object>} - { outputJSONPath, jsonCID, failedPages }
 */
const makePreview = async ({
    inputPDFPath,
    outputJSONPath = path.join(__dirname, "ipfs_cids.json"),
    tempDir = path.join(__dirname, "temp_blur"),
    patchWidth,
    patchHeight = 80,
    blurPercentage = 0.5,
    blurStrength = 15,
    imageResolution = 200,
    uploadBatchSize = 5,
    uploadRetries = 2,
}) => {
    // Validate input
    if (!(await fs.access(inputPDFPath).then(() => true).catch(() => false))) {
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
    await fs.mkdir(tempDir, { recursive: true });

    const failedPages = [];

    try {
        // Step 1: Convert PDF to images
        console.log("🔄 Converting PDF to images...");
        const startConvert = Date.now();
        execSync(`pdftoppm -png -r ${imageResolution} "${inputPDFPath}" "${tempDir}/page"`, { stdio: "inherit" });
        console.log(`PDF conversion took ${Date.now() - startConvert}ms`);

        const files = (await fs.readdir(tempDir)).filter((f) => f.endsWith(".png"));
        if (files.length === 0) {
            throw new Error("No images generated from PDF");
        }
        console.log(`📄 Found ${files.length} pages`);

        const getRandomPatches = (imgWidth, imgHeight) => {
            const effectivePatchWidth = patchWidth || imgWidth;
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

        // Step 2: Process and upload images in batches
        console.log("🖼️ Processing and uploading images in batches...");
        const startProcess = Date.now();

        const processPage = async (file) => {
            const inputImg = path.join(tempDir, file);
            console.log(`🖼️ Processing image: ${inputImg}`);

            try {
                const image = sharp(inputImg);
                const { width, height } = await image.metadata();
                console.log(`📏 Image dimensions: ${width}x${height}`);

                // Extract page number from filename, e.g. "page-1.png"
                const pageMatch = file.match(/page-(\d+)\.png/);
                const pageNumber = pageMatch ? parseInt(pageMatch[1], 10) : null;

                let base = await image.toBuffer();

                // Skip blurring for first two pages
                if (pageNumber > 2) {
                    const patches = getRandomPatches(width, height);

                    for (const patch of patches) {
                        const blurred = await sharp(base)
                            .extract(patch)
                            .blur(blurStrength)
                            .toBuffer();
                        base = await sharp(base)
                            .composite([{ input: blurred, left: patch.left, top: patch.top }])
                            .toBuffer();
                    }
                } else {
                    console.log(`Page ${pageNumber} not blurred`);
                }

                // Retry upload with exponential backoff
                let cid;
                for (let attempt = 0; attempt <= uploadRetries; attempt++) {
                    try {
                        console.log(`Start uploading ${file} to IPFS (attempt ${attempt + 1})...`);
                        const startUpload = Date.now();
                        cid = await uploadFileToIPFS(base, file);
                        console.log(`Uploading ${file} took ${Date.now() - startUpload}ms`);
                        console.log(`End uploading ${file} to IPFS`);
                        console.log(`🚀 Uploaded blurred image to IPFS: ${cid}`);
                        return cid;
                    } catch (err) {
                        console.error(`Upload failed for ${file} (attempt ${attempt + 1}): ${err.message}`);
                        if (attempt < uploadRetries) {
                            const delay = Math.pow(2, attempt) * 1000;
                            console.log(`Retrying after ${delay}ms...`);
                            await new Promise((resolve) => setTimeout(resolve, delay));
                        } else {
                            console.error(`All retries failed for ${file}`);
                            failedPages.push({ file, error: err.message });
                            return null;
                        }
                    }
                }
            } catch (err) {
                console.error(`Processing failed for ${file}: ${err.message}`);
                failedPages.push({ file, error: err.message });
                return null;
            }
        };

        // Process in batches
        for (let i = 0; i < files.length; i += uploadBatchSize) {
            const batch = files.slice(i, i + uploadBatchSize);
            console.log(`Processing batch of ${batch.length} pages...`);
            const cids = await Promise.all(batch.map(processPage));
            ipfsCIDs.push(...cids.filter((cid) => cid));
        }

        console.log(`Image processing and uploads took ${Date.now() - startProcess}ms`);
        console.log(`Failed pages: ${failedPages.length}`, failedPages);

        // Step 3: Create JSON data with list of CIDs
        const jsonData = ipfsCIDs;

        // Step 4: Upload JSON file to IPFS
        console.log("🚀 Uploading JSON to IPFS...");
        let jsonCID;
        for (let attempt = 0; attempt <= uploadRetries; attempt++) {
            try {
                const startUploadJSON = Date.now();
                jsonCID = await uploadJSONToIPFS(jsonData, "ipfs_cids.json");
                console.log(`JSON upload took ${Date.now() - startUploadJSON}ms`);
                console.log("🚀 JSON file uploaded to IPFS with CID:", jsonCID);
                break;
            } catch (err) {
                console.error(`JSON upload failed (attempt ${attempt + 1}): ${err.message}`);
                if (attempt < uploadRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Retrying JSON upload after ${delay}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    console.error("All retries failed for JSON upload");
                    throw new Error(`Failed to upload JSON to IPFS: ${err.message}`);
                }
            }
        }

        // Step 5: Append to local JSON file
        let localJsonData = [];
        try {
            const existingData = await fs.readFile(outputJSONPath, "utf8");
            localJsonData = JSON.parse(existingData);
            if (!Array.isArray(localJsonData)) {
                localJsonData = [];
            }
        } catch (err) {
            console.log(`No existing JSON file found at ${outputJSONPath}, creating new one`);
        }

        localJsonData.push({
            file: path.basename(inputPDFPath),
            jsonCID,
        });

        // await fs.writeFile(outputJSONPath, JSON.stringify(localJsonData, null, 2));
        // console.log("📝 JSON with jsonCID appended to:", outputJSONPath);

        // Return results
        return {
            outputJSONPath,
            jsonCID,
            failedPages,
        };
    } finally {
        // Step 6: Clean up temporary directory
        try {
            if (await fs.access(tempDir).then(() => true).catch(() => false)) {
                await fs.rm(tempDir, { recursive: true, force: true });
                console.log("🧹 Cleaned up temporary directory");
            }
        } catch (err) {
            console.error(`Failed to clean temporary directory: ${err.message}`);
        }
    }
};

module.exports = { makePreview };
