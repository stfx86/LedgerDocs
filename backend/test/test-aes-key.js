// test-aes-key.js
const { saveAESKey } = require("../src/utils/saveAESKey"); const { getAESKey } = require("../src/utils/getAESKey");

(async () => {
    try {
        const testDocId = 9910;
        const testAESKey = "3bcd1432ef567890abcd1234ef567810";

        // 🧪 Save the AES key
        console.log("Saving AES key...");
        await saveAESKey(testDocId, testAESKey);

        // 🧪 Retrieve the AES key
        console.log("Retrieving AES key...");
        const retrievedKey = await getAESKey(testDocId);
        console.log("✅ Retrieved Key:", retrievedKey);

        // ✅ Validate match
        if (retrievedKey === testAESKey) {
            console.log("🎉 Test successful: AES key saved and retrieved correctly.");
        } else {
            console.error("❌ Mismatch! Retrieved key is not equal to saved key.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
})();
