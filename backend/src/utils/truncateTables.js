const db = require('./db'); // Import your connection module

async function truncateTables() {
    let conn;
    try {
        conn = await db.getConnection(); // Get a connection from the pool

        // List of tables to truncate (modify as needed)
        const tablesToTruncate = [
            'aes_keys'
           
        ];

        // Execute TRUNCATE for each table
        for (const table of tablesToTruncate) {
            await conn.query(`TRUNCATE TABLE ${table}`);
            console.log(`[DB] Truncated table: ${table}`);
        }

        console.log('[DB] All tables truncated successfully!');
    } catch (err) {
        console.error('[DB] Error truncating tables:', err);
    } finally {
        if (conn) {
            await conn.end(); // Release the connection back to the pool
            console.log('[DB] Connection released.');
        }
    }
}

// Run the function
module.exports = { truncateTables }