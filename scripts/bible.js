const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('./db');

const allowedVerses = ["Philippians 4:13", "Jeremiah 29:11", "Isaiah 40:31", "Psalm 23:1", /* truncated for brevity */ "John 20:29"];

router.get('/api/verse-today', async (req, res) => {
  const randomIndex = Math.floor(Math.random() * allowedVerses.length);
  const verseToFetch = allowedVerses[randomIndex];
  try {
    const response = await axios.get(`https://bible-api.com/${encodeURIComponent(verseToFetch)}`);
    if (response.data && response.data.text) {
      res.json({ reference: response.data.reference, text: response.data.text });
    } else {
      res.json({ reference: "N/A", text: "No verse available today." });
    }
  } catch (error) {
    console.error("Error fetching verse of the day:", error);
    res.status(500).json({ reference: "N/A", text: "Unable to fetch verse." });
  }
});

router.get('/api/verse-search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Search query is required." });
  try {
    const response = await axios.get(`https://bible-api.com/${encodeURIComponent(query)}`);
    if (response.data && response.data.text) {
      res.json({ verses: [{ text: response.data.text, reference: response.data.reference }] });
    } else {
      res.json({ verses: [] });
    }
  } catch (error) {
    console.error("Failed to search for Bible verses:", error);
    res.status(500).json({ error: "Not a valid search." });
  }
});

router.get('/api/next-event', (req, res) => {
  const now = new Date();
  const sql = `SELECT * FROM calendar_events WHERE event_date >= ? ORDER BY event_date ASC LIMIT 1`;
  db.query(sql, [now], (err, result) => {
    if (err) {
      console.error("Error fetching event:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0] || {});
  });
});

module.exports = router;

