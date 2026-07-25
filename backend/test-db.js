const mysql = require('mysql2');
require('dotenv').config();

console.log('--- Database Diagnostic ---');
console.log('Attempting to connect with:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('DB:', process.env.DB_NAME);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('FAILED: Connection error:', err.message);
        process.exit(1);
    }
    console.log('SUCCESS: Connected to MySQL!');
    
    db.query('SELECT * FROM players', (err, rows) => {
        if (err) {
            console.error('FAILED: Could not query players table:', err.message);
        } else {
            console.log('SUCCESS: Query players table. Count:', rows.length);
            console.log('Sample data:', rows.slice(0, 2));
        }
        db.end();
        process.exit(0);
    });
});
