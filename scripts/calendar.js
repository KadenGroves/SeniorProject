const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ✅ Define the helper function BEFORE using it
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/eventImages/"),
  filename: (req, file, cb) => cb(null, req.session.user.id + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET calendar page
router.get('/calendar', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

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
      console.error("Calendar error:", err);
      return res.status(500).send("Error loading events");
    }

    // ✅ This now works because getDaysInMonth is already defined
    const daysInMonth = getDaysInMonth(year, month);
    const firstWeekday = firstDay.getDay();

    res.render('calendar', {
      user: req.session.user,
      events,
      year,
      month,
      daysInMonth,
      firstWeekday
    });
  });
});

// POST to add a calendar event
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
