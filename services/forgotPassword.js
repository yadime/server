const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const db = require('../config/db'); 

// Endpoint to send reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expiration = new Date(Date.now() + 3600000); // 1-hour expiration

  const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(404).json({ message: 'No account with that email found.' });
  }

  await db.query('UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?', [token, expiration, email]);
  
  const transporter = nodemailer.createTransport({ /* SMTP config */ });
  const resetUrl = `http://localhost:3002/reset-password/${token}`;

  try {
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });
    res.json({ message: 'Password reset link sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// Endpoint to reset the password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const [user] = await db.query('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > NOW()', [token]);
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?', [hashedPassword, user.id]);
  res.json({ message: 'Password reset successfully!' });
});

module.exports = router;
