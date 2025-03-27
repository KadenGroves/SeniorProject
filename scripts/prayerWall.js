const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('./db');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, req.session.user.id + '.png')
});
const upload = multer({ storage });


if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));
router.get('/PrayerWall', (req, res) => {
  if (req.session.user == null) {
    res.redirect('/login');
    return;
  } 

  const sql = `
    SELECT prayer_wall.*, users.username 
    FROM prayer_wall 
    JOIN users ON prayer_wall.author_id = users.id 
    ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to retrieve prayer requests:", err);
      return res.status(500).json({ error: "Failed to retrieve prayer requests" });
    }
    res.render('PrayerWall', { prayers: results });
  });
});

router.post('/PrayerWall', upload.single("image"), (req, res) => {
  const { title, description } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: "You must be logged in to post a prayer request." });
  }
  
  const authorId = user.id;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const sql = "INSERT INTO prayer_wall (title, description, author_id, image_url) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, description, authorId, imageUrl], (err) => {
    if (err) {
      console.error("Failed to submit prayer request:", err);
      return res.status(500).json({ error: "Failed to submit prayer request" });
    }
    res.redirect('/PrayerWall');
  });
});

module.exports = router;