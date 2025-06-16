const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const { uploadFileToIPFS, uploadJSONToIPFS } = require("../src/utils/ipfs");
const { makePreview } = require("../src/utils/makePreview");
const { encryptAndUploadPDF } = require("../src/utils/encrypt-upload");

const fetchArxivResults = async (query, limit) => {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
        query
    )}&start=0&max_results=${limit}`;
    const { data } = await axios.get(url);
    const parsed = await parseStringPromise(data);
    return parsed.feed.entry || [];
};

const sanitizeFilename = (str) => str.replace(/[^a-z0-9]/gi, "_").toLowerCase();

const processDocument = async (entry, index) => {
    try {
        const title = entry.title[0].trim();
        const summary = entry.summary[0].trim();
        const pdfUrl = entry.link.find((l) => l.$.type === "application/pdf").$.href;
        const categories = entry.category.map((c) => c.$.term);
        const arxivId = entry.id[0].split("/abs/")[1];

        const tempPDFPath = path.join("downloads", `${sanitizeFilename(arxivId)}.pdf`);
        fs.mkdirSync("downloads", { recursive: true });

        // 1. Download PDF
        const pdfRes = await axios.get(pdfUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(tempPDFPath, pdfRes.data);

        // 2. Encrypt & upload
        const { cid: encryptedCid, key, iv } = await encryptAndUploadPDF({ inputPDF: tempPDFPath });

        // 3. Generate preview
        const { jsonCID: previewCid, thumbnailCid } = await makePreview({ inputPDFPath: tempPDFPath });


        // 4. Extract thumbnail
        // const thumbnailCid = previewCid;

        // 5. Upload metadata
        const metadata = {
            title,
            summary,
            authors: entry.author.map((a) => a.name[0]),
            arxivId,
        };
        const metadataCid = await uploadJSONToIPFS(metadata);

        // 6. Upload description
        const descriptionCid = await uploadJSONToIPFS({ description: summary });

        return {
            title,
            categories,
            price: 0,
            uploaderAddress: "0x0000000000000000000000000000000000000000",
            metadataCid,
            encryptedCid,
            descriptionCid,
            previewCid,
            thumbnailCid,
            encryptionKeyHex: Buffer.from(key).toString("hex"),
            ivHex: Buffer.from(iv).toString("hex"),
        };
    } catch (err) {
        console.error(`❌ Document processing failed [${index}] —`, err.message);
        return null;
    }
};

const readPreviousDocs = (outputPath) => {
    try {
        if (fs.existsSync(outputPath)) {
            const raw = fs.readFileSync(outputPath, "utf-8");
            return JSON.parse(raw);
        }
    } catch (err) {
        console.warn("⚠️ Failed to read previous docs.json. Starting fresh.");
    }
    return [];
};

const main = async () => { const query = process.argv[2] || "blockchain";
    const limit = parseInt(process.argv[3]) || 10;
    const outputPath = path.join("docs.json");

    console.log(`🔍 Fetching ${limit} documents for query: "${query}"...`);
    const entries = await fetchArxivResults(query, limit);

    let previousDocs = readPreviousDocs(outputPath);

    for (let i = 0; i < entries.length; i++) {
        console.log(`\n📄 [${i + 1}/${entries.length}] ${entries[i].title[0].trim()}`);
        const doc = await processDocument(entries[i], i);
        if (doc) {
            previousDocs.push(doc); // append to current memory
            fs.writeFileSync(outputPath, JSON.stringify(previousDocs, null, 2)); // save after each doc
            console.log(`✅ Document ${i + 1} saved to ${outputPath}`);
        } else {
            console.warn(`⚠️ Skipped saving document [${i + 1}] due to error.`);
        }
    }

    console.log(`\n✅ Finished. Total saved documents: ${previousDocs.length}`);
    if (previousDocs.length < entries.length) {
        console.warn(`⚠️ ${entries.length - previousDocs.length} documents failed to process.`);
    }
};


main().catch((err) => console.error("❌ Fatal error:", err));
