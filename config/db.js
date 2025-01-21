const mysql = require('mysql');
const fs = require('fs');  // Ensure fs is required

// Create MySQL connection with SSL
const db = mysql.createConnection({
    user: '2jipex2gt3Jj5gd.root',
    host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    password: 'cFoVU1esEcObfWsh',
    database: 'studentdb',
    ssl: {
        // Use the correct absolute path to your PEM certificates
        ca: fs.readFileSync('cert/isrgrootx1.pem'),  // Path to the CA certificate
        rejectUnauthorized: true // Ensure SSL connection is validated
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
