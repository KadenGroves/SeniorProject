const express = require('express');
const router = express.Router();
const db = require('./db');

// Utilities to get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Render calendar page
router.get('/calendar', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth(); // 0 = Jan

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

    const daysInMonth = getDaysInMonth(year, month);
    const firstWeekday = firstDay.getDay(); // 0 = Sunday

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

router.post('/calendar', (req, res) => {
  const { title, description, event_date } = req.body;
  const user = req.session.user;

  if (!user || !title || !event_date) {
    return res.status(400).send("Missing required fields");
  }

  const sql = `INSERT INTO calendar_events (title, description, event_date, created_by) VALUES (?, ?, ?, ?)`;
  db.query(sql, [title, description, event_date, user.id], (err) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).send("Error saving event");
    }

    // Redirect to the correct month/year
    const date = new Date(event_date);
    res.redirect(`/calendar?month=${date.getMonth()}&year=${date.getFullYear()}`);
  });
});

module.exports = router;
