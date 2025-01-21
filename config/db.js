require('dotenv').config(); // Load environment variables
const mysql = require('mysql');
const fs = require('fs');

// Check if the certificate file exists and log the path
const sslCaPath = process.env.DB_SSL_CA_PATH;
if (!fs.existsSync(sslCaPath)) {
    console.error(`Certificate file not found at: ${sslCaPath}`);
} else {
    console.log(`Loading certificate from: ${sslCaPath}`);
    try {
        // Read and log the certificate contents to ensure it's loaded
        const sslCaContent = fs.readFileSync(sslCaPath, 'utf8');
        console.log('Certificate contents loaded successfully:');
        console.log(sslCaContent.substring(0, 200)); // Display the first 200 characters for security reasons
    } catch (err) {
        console.error('Error reading certificate file:', err);
    }
}

// Create MySQL connection with SSL
const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.existsSync(sslCaPath) ? fs.readFileSync(sslCaPath) : null, // Path to the CA certificate
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' // Ensure SSL connection is validated
    }
});

// Function to connect to the database
function connectToDatabase() {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(connectToDatabase, 2000); // Retry after 2 seconds if connection fails
        } else {
            console.log('Connected to the MySQL database.');
        }
    });
}

// Initially connect to the database
connectToDatabase();

// Handle lost connections by attempting to reconnect
db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Connection lost, attempting to reconnect...');
        connectToDatabase();  // Call the function to reconnect
    } else {
        console.error('Unexpected database error:', err);
    }
});

// Export router for routes and db for database operations
module.exports = db;
