const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
  res.render('index'); 
});

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, hashedPassword, role || "user"], (err) => {
      if (err) return res.status(500).json({ error: "Error registering user", details: err });
      res.redirect('/');
    });
  } catch (error) {
    res.status(500).json({ error: "Error hashing password" });
  }
});

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });
  
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });
    
    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid email or password" });
    
    res.redirect('/profile');
  });
});

module.exports = router;