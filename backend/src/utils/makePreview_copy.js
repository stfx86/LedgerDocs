const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");
const { execSync } = require("child_process");
const { uploadFileToIPFS, uploadJSONToIPFS } = require("./ipfs");

require("dotenv").config();

/**
 * Creates blurred preview images from a PDF, uploads them to IPFS in-memory, and appends to a JSON file.
 * @param {Object} config - Configuration object
 * @param {string} config.inputPDFPath - Path to the input PDF file
 * @param {string} [config.outputJSONPath] - Path for the output JSON file (defaults to 'ipfs_cids.json')
 * @param {string} [config.tempDir] - Temporary directory for image processing (defaults to 'temp_blur')
 * @param {number} [config.patchWidth] - Width of blur patches (uses full image width if not specified)
 * @param {number} [config.patchHeight=80] - Height of blur patches
 * @param {number} [config.blurPercentage=0.5] - Percentage of page to blur (0 to 1)
 * @param {number} [config.blurStrength=15] - Strength of the blur effect
 * @param {number} [config.imageResolution=200] - Resolution for PDF-to-image conversion (DPI)
 * @param {number} [config.uploadBatchSize=5] - Number of concurrent IPFS uploads
 * @param {number} [config.uploadRetries=2] - Number of retry attempts for failed uploads
 * @param {number} [config.unblurredPages=2] - Number of first pages to skip blurring
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
                           unblurredPages = 2,
}) => {
    if (!(await fs.access(inputPDFPath).then(() => true).catch(() => false))) {
        throw new Error(`Input PDF file does not exist: ${inputPDFPath}`);
    }

    if (blurPercentage < 0 || blurPercentage > 1) {
        throw new Error("blurPercentage must be between 0 and 1");
    }

    await fs.mkdir(tempDir, { recursive: true });

    const failedPages = [];

    try {
        console.log("🔄 Converting PDF to images...");
        const startConvert = Date.now();
        execSync(`pdftoppm -png -r ${imageResolution} "${inputPDFPath}" "${tempDir}/page"`, { stdio: "inherit" });
        console.log(`PDF conversion took ${Date.now() - startConvert}ms`);

        const files = (await fs.readdir(tempDir)).filter((f) => f.endsWith(".png")).sort();
        if (files.length === 0) throw new Error("No images generated from PDF");
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
            return patches;
        };

        const ipfsCIDs = [];

        const processPage = async (file, pageNumber) => {
            const inputImg = path.join(tempDir, file);
            console.log(`🖼️ Processing image: ${inputImg}`);

            try {
                const image = sharp(inputImg);
                const { width, height } = await image.metadata();
                let base = await image.toBuffer();

                if (pageNumber > unblurredPages) {
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

                let cid;
                for (let attempt = 0; attempt <= uploadRetries; attempt++) {
                    try {
                        cid = await uploadFileToIPFS(base, file);
                        console.log(`🚀 Uploaded to IPFS: ${cid}`);
                        return cid;
                    } catch (err) {
                        if (attempt < uploadRetries) {
                            const delay = Math.pow(2, attempt) * 1000;
                            console.log(`Retrying after ${delay}ms...`);
                            await new Promise((res) => setTimeout(res, delay));
                        } else {
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

        console.log("🖼️ Processing and uploading images in batches...");
        const startProcess = Date.now();

        for (let i = 0; i < files.length; i += uploadBatchSize) {
            const batch = files.slice(i, i + uploadBatchSize);
            const batchPromises = batch.map((file, idx) => processPage(file, i + idx + 1));
            const cids = await Promise.all(batchPromises);
            ipfsCIDs.push(...cids.filter(Boolean));
        }

        console.log(`Image processing and uploads took ${Date.now() - startProcess}ms`);
        console.log(`❌ Failed pages:`, failedPages);

        console.log("🚀 Uploading JSON to IPFS...");
        let jsonCID;
        for (let attempt = 0; attempt <= uploadRetries; attempt++) {
            try {
                jsonCID = await uploadJSONToIPFS(ipfsCIDs, "ipfs_cids.json");
                console.log("✅ Uploaded IPFS JSON:", jsonCID);
                break;
            } catch (err) {
                if (attempt < uploadRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Retrying JSON upload after ${delay}ms...`);
                    await new Promise((res) => setTimeout(res, delay));
                } else {
                    throw new Error("Failed to upload JSON to IPFS: " + err.message);
                }
            }
        }

        let localJsonData = [];
        try {
            const existing = await fs.readFile(outputJSONPath, "utf8");
            localJsonData = JSON.parse(existing);
            if (!Array.isArray(localJsonData)) localJsonData = [];
        } catch (e) {
            console.log("Creating new JSON file...");
        }

        localJsonData.push({
            file: path.basename(inputPDFPath),
                           jsonCID,
        });

        // await fs.writeFile(outputJSONPath, JSON.stringify(localJsonData, null, 2));

        return {
            outputJSONPath,
            jsonCID,
            failedPages,
        };
    } finally {
        try {
            if (await fs.access(tempDir).then(() => true).catch(() => false)) {
                await fs.rm(tempDir, { recursive: true, force: true });
                console.log("🧹 Cleaned up temporary directory");
            }
        } catch (err) {
            console.error("❌ Failed to clean temporary directory:", err.message);
        }
    }
};

module.exports = { makePreview };
