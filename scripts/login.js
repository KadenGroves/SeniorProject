require('dotenv').config();
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

const path = require('path');
const bodyParser = require('body-parser');
const app = express(); 


app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const loginRoutes = require('./login');
const prayerWallRoutes = require('./prayerWall');
const profileRoutes = require('./profile');

app.use(loginRoutes);
app.use(prayerWallRoutes);
app.use(profileRoutes);

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/calendar', (req, res) => {
  res.render('calendar.ejs');
});

app.get('/chat', (req, res) => {
  res.render('chat.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/orgFinder', (req, res) => {
  res.render('orgFinder.ejs');
});

app.get('/prayerWall', (req, res) => {
  res.render('prayerWall.ejs');
});

app.get('/profile', (req, res) => {
  res.render('profile.ejs');
});

app.get('/survey', (req, res) => {
  res.render('survey.ejs');
});


app.listen(3000, () => {
  console.log('Listening on port 3000');
});

