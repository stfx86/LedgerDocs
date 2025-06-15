const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',    // Hostname
    port: 3306,          // Port number
    user: 'stof',
    password: 'bennasser',
    database: 'LedgerDocs',
    connectionLimit: 5
});

// Function to get a connection
async function getConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('[DB] Connection acquired:', conn.threadId); // Optional: Log connection ID for debugging
        return conn;
    } catch (err) {
        console.error('[DB] Connection error:', err);
        throw err;
    }
}

module.exports = {
    getConnection
};