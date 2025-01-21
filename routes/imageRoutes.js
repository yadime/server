const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  }
});

const upload = multer({ storage: storage });

// POST route for uploading an image
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({ message: 'Image uploaded successfully', file: req.file });
});

module.exports = router;
