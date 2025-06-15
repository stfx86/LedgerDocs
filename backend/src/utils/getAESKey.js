const { getConnection } = require('./db');

/**
 * Get AES key from MariaDB by document ID.
 * @param {number} docId - Document ID.
 * @returns {Promise<string|null>} - AES key as hex string or null if not found.
 */
async function getAESKey(docId) {
    const query = 'SELECT `key` FROM aes_keys WHERE id = ?';
    let conn;

    try {
        conn = await getConnection();
        const [rows] = await conn.query(query, [docId]);

        if (rows.length === 0) {
            console.warn(`⚠️ No AES key found for docId ${docId}`);
            return null;
        }
            console.log("rows::",rows)
        return rows.key;
    } catch (error) {
        console.error("❌ Error retrieving AES key for docId", docId, ":", error);
        throw error;
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
}

module.exports = { getAESKey };