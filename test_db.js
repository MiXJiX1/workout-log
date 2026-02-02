import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testConnection() {
    console.log('Testing database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    // Don't log password for security, just length
    console.log(`Password length: ${process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('✅ Connection Successful!');

        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ Query Test Successful: ', rows[0]);

        // Check if users table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            console.log("✅ 'users' table exists.");
        } else {
            console.error("❌ 'users' table DOES NOT exist. Please import database.sql.");
        }

        await connection.end();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('👉 Check your DB_PASSWORD in .env file.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`👉 Database '${process.env.DB_NAME}' does not exist. Import database.sql.`);
        }
    }
}

testConnection();
