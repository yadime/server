// Dependencies
const express = require('express');
const app = express();
const cors = require('cors');
const bcryptjs = require('bcryptjs'); // For hashing passwords
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ImageKit = require('imagekit');
const multer = require('multer');

// Database connection
const db = require('../server/config/db');

// Imported Routes
const enrollmentRoutes = require('./routes/enrollment');
const studentRoutes = require('./routes/students');
const coursesRoutes = require('./routes/courses');
const instructorRoutes = require('./routes/instructor');
const paymentRoutes = require('./routes/payment');
const imageRoutes = require('./routes/imageRoutes');
const forgotPassword = require('../server/services/forgotPassword');
const advising = require('./routes/advising')


// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/enrollment', enrollmentRoutes);
app.use('/students', studentRoutes);
app.use('/courses', coursesRoutes);
app.use('/instructor', instructorRoutes);
app.use('/payment', paymentRoutes);
app.use('/upload-images', imageRoutes);
app.use('/forgot-password', forgotPassword);
app.use('/advising', advising);


// Run the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// SMTP Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'brantcordova0@gmail.com', // Replace with your email
        pass: 'egrmiysicozjruwt'  // Replace with your email app password
    }
});

// Forgot Password Route
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required!' });
    const SQL = 'SELECT id FROM users WHERE email = ?';
    db.query(SQL, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error. Please try again.' });
        if (results.length === 0) return res.status(404).json({ message: 'Email not found!' });

        const resetCode = crypto.randomInt(100000, 999999).toString();
        const userId = results[0].id;
        const expires = new Date(Date.now() + 3600000); // Expires in 1 hour
        db.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [userId, resetCode, expires], (insertErr) => {
            if (insertErr) return res.status(500).json({ message: 'Error storing reset code.' });

            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Code',
                html: `<p>Reset Code: <strong>${resetCode}</strong></p><p>Expires in 1 hour.</p>`
            }, (mailErr) => {
                if (mailErr) return res.status(500).json({ message: 'Error sending email.' });
                res.status(200).json({ message: 'Reset code sent!' });
            });
        });
    });
});

// Reset Password Route
app.post('/reset-password', async (req, res) => {
    const { resetCode, newPassword } = req.body;
    if (!resetCode || !newPassword) return res.status(400).json({ message: 'Code and new password required.' });
    db.query('SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()', [resetCode], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error.' });
        if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired code.' });

        const userId = results[0].user_id;
        try {
            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (updateErr) => {
                if (updateErr) return res.status(500).json({ message: 'Error updating password.' });
                db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
                res.status(200).json({ message: 'Password reset successful.' });
            });
        } catch {
            res.status(500).json({ message: 'Error processing password reset.' });
        }
    });
});

// Register route
app.post('/register', async (req, res) => {
    const { Name, Email, UserName, Password, StudentType } = req.body;
    const saltRounds = 10;
    try {
        // Check if the username already exists
        const userCheckQuery = 'SELECT username FROM users WHERE username = ?';
        db.query(userCheckQuery, [UserName], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Server error. Please try again later.' });
            if (results.length > 0) {
                return res.status(400).json({ error: 'Username already exists. Choose a different username.' });
            }

            // Hash the password
            const hashedPassword = await bcryptjs.hash(Password, saltRounds);
            const SQL = 'INSERT INTO users (name, email, username, password, student_type) VALUES (?, ?, ?, ?, ?)';
            const values = [Name, Email, UserName, hashedPassword, StudentType ];

            db.query(SQL, values, (insertErr) => {
                if (insertErr) return res.status(500).json({ error: 'Failed to register user.' });
                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to hash password. Please try again.' });
    }
});

// Login route
app.post('/login', (req, res) => {
    const { LoginUserName, LoginPassword } = req.body;
    if (!LoginUserName || !LoginPassword) {
        return res.status(400).json({ message: 'Username and password are required!' });
    }

    const SQL = 'SELECT username, password, student_type FROM users WHERE username = ?';
    db.query(SQL, [LoginUserName], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error.' });
        }
        if (results.length > 0) {
            const user = results[0];
            const isPasswordMatch = await bcryptjs.compare(LoginPassword, user.password);
            if (isPasswordMatch) {
                res.status(200).json({
                    message: 'Login successful!',
                    studentType: user.student_type
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials.' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    });
});


// ImageKit Configuration
const VALID_FOLDERS = ["COG_CS", "COG_IT", "CHECKLIST_IT", "CHECKLIST_CS", "GCASH_CS", "GCASH_IT", "ENROLLMENT_REQ"];

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_KeJUi1g6LmpCD8x2otaL3PKVRy0=",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_8Dcm78KrXTCRsEUc1Mf13hsvcN8=",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/hzndzq3sf/",
});

const upload = multer();
app.post("/api/upload", upload.single("file"), (req, res) => {
    const { file } = req;
    const { folder, username } = req.body;
    if (!file || !username || !VALID_FOLDERS.includes(folder)) return res.status(400).json({ message: 'Invalid data.' });
    const fileName = `${username}_${Date.now()}.${file.originalname.split('.').pop()}`;
    imagekit.upload({ file: file.buffer.toString("base64"), fileName, folder }, (error, result) => {
        if (error) return res.status(500).json({ message: 'Upload error.' });
        res.status(200).json({ message: 'Upload successful.', url: result.url });
    });
});

app.get("/api/files", (req, res) => {
    const folderPath = req.query.folderPath || "/";
    imagekit.listFiles({ path: folderPath, limit: 10 }, (error, result) => {
        if (error) return res.status(500).json({ message: 'Fetch error.' });
        res.status(200).json(result.length ? { files: result } : { message: 'No files found.' });
    });
});
