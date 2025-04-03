// scripts/calendar.js
const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/eventImages/"),
  filename: (req, file, cb) => cb(null, req.session.user.id + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Serve calendar.html
router.get('/calendar', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../views/calendar.html'));
});

// API for calendar data
router.get('/api/calendar', (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const sql = `
    SELECT * FROM calendar_events 
    WHERE event_date BETWEEN ? AND ?
    ORDER BY event_date ASC`;

  db.query(sql, [firstDay, lastDay], (err, events) => {
    if (err) {
      console.error("API calendar error:", err);
      return res.status(500).json({ error: "Failed to load events" });
    }
    res.json({ events, year, month });
  });
});

// Add new calendar event
router.post('/calendar', upload.single('image'), (req, res) => {
  const { title, description, event_date } = req.body;
  const user = req.session.user;

  if (!user || !title || !event_date) {
    return res.status(400).send("Missing required fields");
  }

  const image_url = req.file ? `/uploads/eventImages/${req.file.filename}` : null;
  const sql = `INSERT INTO calendar_events (title, description, event_date, created_by, image_url) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [title, description, event_date, user.id, image_url], (err) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).send("Error saving event");
    }
    const date = new Date(event_date);
    res.redirect(`/calendar?month=${date.getMonth()}&year=${date.getFullYear()}`);
  });
});

module.exports = router;