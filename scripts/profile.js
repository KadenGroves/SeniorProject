const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profilePics"),
  filename: (req, file, cb) => cb(null, req.session.user.id + '.png')
});
const upload = multer({ storage });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Utility function
function maskEmail(email) {
  const atIndex = email.indexOf('@');
  return email[0] + '*****' + email.slice(atIndex);
}

// Serve the profile page
router.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../views/profile.html'));
});

// API endpoint for fetching current user info
router.get('/api/user', (req, res) => {
  if (!req.session.user) return res.json(null);

  const userId = req.session.user.id;
  const sql = 'SELECT id, username, email, role, created_at, profile_picture FROM users WHERE id = ?';

  db.query(sql, [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Failed to fetch user:", err);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    const user = results[0];
    user.hiddenEmail = maskEmail(user.email);
    res.json(user);
  });
});

// Upload profile image
router.post('/uploadProfileImage', upload.single("image"), (req, res) => {
  const user = req.session.user;
  const imageUrl = req.file ? `/uploads/profilePics/${req.file.filename}` : null;

  const sql = 'UPDATE users SET profile_picture = ? WHERE id = ?';
  db.query(sql, [imageUrl, user.id], (err) => {
    if (err) {
      console.error("Failed to replace Image:", err);
      return res.status(500).json({ error: "Failed to replace Image" });
    }
    res.redirect('/profile');
  });
});

// Password change
router.post('/changePassword', (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');

  const { oldPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) return res.status(500).send('User not found');

    const user = results[0];
    if (!user.password_hash) return res.status(500).send('User has no password set');

    bcrypt.compare(oldPassword, user.password_hash, (err, isMatch) => {
      if (err || !isMatch) return res.status(400).send('Old password is incorrect');

      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) return res.status(500).send('Error hashing password');

        db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId], (err) => {
          if (err) return res.status(500).send('Error updating password');
          res.redirect('/profile');
        });
      });
    });
  });
});

module.exports = router;
