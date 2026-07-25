const mysql = require('mysql2');
require('dotenv').config({ path: 'C:/Users/Administrator/Documents/DATABASE PROJECT/Gaming Tournament Management System/backend/.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

db.connect(err => {
    if (err) {
        console.error('Error connecting:', err);
        process.exit(1);
    }
    console.log('Connected to database.');
    db.query(createUsersTable, (err, results) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Users table created or already exists.');
            
            // Add a default admin user if not exists
            const adminEmail = 'admin@tekken.com';
            const adminPass = 'admin123';
            db.query('INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, adminPass, 'admin'], (err) => {
                if (err) console.error('Error adding admin:', err);
                else console.log('Default admin user checked/added.');
                db.end();
            });
        }
    });
});
