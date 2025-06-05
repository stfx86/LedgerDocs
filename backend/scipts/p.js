const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execSync } = require("child_process");
const { PDFDocument } = require("pdf-lib");
const { uploadFileToIPFS, uploadJSONToIPFS } = require("./../src/utils/ipfs"); // Import IPFS functions
require("dotenv").config();

// === PDF Processing Configuration ===
const inputPDF = path.join(__dirname, "p.pdf");
const outputPDF = path.join(__dirname, "preview_blurred.pdf");
const tempDir = path.join(__dirname, "temp_blur");
const outputJSON = path.join(__dirname, "ipfs_cids.json");

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// === CONFIG ===
const PATCH_WIDTH = 120;
const PATCH_HEIGHT = 80;
const BLUR_PERCENTAGE = 0.5; // 50% of the page will be blurred
const BLUR_STRENGTH = 15; // Strength of the blur

// Step 1: Convert PDF to images
console.log("🔄 Converting PDF to images...");
execSync(`pdftoppm -png -r 150 "${inputPDF}" "${tempDir}/page"`);

const files = fs.readdirSync(tempDir).filter((f) => f.endsWith(".png"));

const getRandomPatches = (imgWidth, imgHeight) => {
    const patchHeight = PATCH_HEIGHT;
    const patchWidth = imgWidth; // Full width
    const patchArea = patchWidth * patchHeight;
    const pageArea = imgWidth * imgHeight;
    const patchCount = Math.floor((pageArea * BLUR_PERCENTAGE) / patchArea);

    const patches = [];
    for (let i = 0; i < patchCount; i++) {
        const top = Math.floor(Math.random() * (imgHeight - patchHeight));
        patches.push({
            left: 0,
            top,
            width: patchWidth,
            height: patchHeight,
        });
    }
    return patches;
};

(async () => {
    const ipfsCIDs = [];

    // Step 2: Process and blur images, then upload to IPFS
    for (const file of files) {
        const inputImg = path.join(tempDir, file);
        const outputImg = path.join(tempDir, "blurred_" + file);
        const image = sharp(inputImg);
        const { width, height } = await image.metadata();

        let base = await image.clone().toBuffer();
        const patches = getRandomPatches(width, height);

        for (const patch of patches) {
            const blurred = await sharp(base)
                .extract(patch)
                .blur(BLUR_STRENGTH)
                .toBuffer();

            base = await sharp(base)
                .composite([{ input: blurred, left: patch.left, top: patch.top }])
                .toBuffer();
        }

        await sharp(base).toFile(outputImg);
        console.log(`🖼️ Blurred image created: ${outputImg}`);

        // Upload blurred image to IPFS
        const cid = await uploadFileToIPFS(outputImg, `blurred_${file}`);
        ipfsCIDs.push({ file: `blurred_${file}`, cid });
        console.log(`🚀 Uploaded blurred image to IPFS: ${cid}`);
    }

    // Step 3: Convert images back to PDF
    const newPdf = await PDFDocument.create();
    for (const file of files) {
        const imgBytes = fs.readFileSync(path.join(tempDir, "blurred_" + file));
        const img = await newPdf.embedPng(imgBytes);
        const page = newPdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    fs.writeFileSync(outputPDF, await newPdf.save());
    console.log("✅ Blurred preview PDF saved:", outputPDF);

    // Step 4: Save IPFS CIDs to JSON file
    fs.writeFileSync(outputJSON, JSON.stringify(ipfsCIDs, null, 2));
    console.log("📝 IPFS CIDs saved to:", outputJSON);

    // Step 5: Upload JSON file to IPFS
    const jsonCID = await uploadJSONToIPFS(ipfsCIDs, "ipfs_cids.json");
    console.log("🚀 JSON file uploaded to IPFS with CID:", jsonCID);

    // Step 6: Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log("🧹 Cleaned up temporary directory");
})();