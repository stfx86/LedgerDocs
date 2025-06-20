const crypto = require("crypto");
const { saveAESKey } = require("../src/utils/saveAESKey2");
const { getAESKey } = require("../src/utils/getAESKey2");

(async () => {
    const docId = 3; // Simulated document ID
    const originalAESKey = "1cd2adf1b7ef713101e05a21abbea90527470cfc9b921fcb9ebec36852a7edeb".toString("    hex"); // ✅ 256-bit AES key

    console.log(`\n🧪 Testing AES key storage for docId ${docId}`);
    console.log("Original AES Key (hex):", originalAESKey);

    await saveAESKey(docId, originalAESKey);

    const retrievedKey = await getAESKey(docId);

    if (!retrievedKey) {
        console.error("❌ Failed to retrieve AES key.");
        process.exit(1);
    }

    console.log("Retrieved AES Key (hex):", retrievedKey);

    if (retrievedKey === originalAESKey) {
        console.log("✅ AES key successfully encrypted, stored, retrieved, and decrypted!");
    } else {
        console.error("❌ Mismatch between original and retrieved AES keys.");
    }
})();
