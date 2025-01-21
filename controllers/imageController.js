const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');  // Store images in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid conflicts
    }
});

const upload = multer({ storage: storage }).single('image');

// Handle image upload and store path in the database
const uploadImage = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).send('Error uploading image');
        }

        // Save the image path in the database
        const imagePath = `/uploads/${req.file.filename}`;
        const query = 'INSERT INTO images (image_path) VALUES (?)';
        db.query(query, [imagePath], (err, result) => {
            if (err) {
                console.error('Error saving image path:', err);
                return res.status(500).send('Error saving image path');
            }
            res.status(200).send('Image uploaded and path saved');
        });
    });
};

module.exports = { uploadImage };
