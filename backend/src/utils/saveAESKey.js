const { getConnection } = require('./db');

/**
 * Save AES key to MariaDB.
 * @param {number} docId - Document ID (same as contract ID).
 * @param {string} aesKeyHex - AES key in hex format.
 */
async function saveAESKey(docId, aesKeyHex) {
    const query = 'INSERT INTO aes_keys (id, `key`) VALUES (?, ?)';
    let conn;

    try {
        conn = await getConnection();
        await conn.query(query, [docId, aesKeyHex]);
        console.log(`✅ AES key saved for docId ${docId}`);
    } catch (error) {
        console.error("❌ Error saving AES key:", error);
        throw error;
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
}

module.exports = { saveAESKey };