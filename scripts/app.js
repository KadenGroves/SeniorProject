require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
const session = require('express-session');

const app = express();

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware to set user data globally
app.use((req, res, next) => {
  if (req.session.user) {
    const userId = req.session.user.id;
    db.query('SELECT username, profile_picture FROM users WHERE id = ?', [userId], (err, results) => {
      if (err || results.length === 0) {
        res.locals.user = null;
      } else {
        req.session.user.username = results[0].username;
        req.session.user.profile_picture = results[0].profile_picture || '/uploads/default-profile.png';
        res.locals.user = req.session.user;
      }
      next();
    });
  } else {
    res.locals.user = null;
    next();
  }
});

// Corrected static paths
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads/eventImages', express.static(path.join(__dirname, 'scripts/uploads/eventImages')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const bibleRoutes = require('./bible');
const loginRoutes = require('./login');
const calendarRoutes = require('./calendar');
const chatRoutes = require('./chat');
const prayerWallRoutes = require('./prayerWall');
const profileRoutes = require('./profile');
const surveyRoutes = require('./survey');
const surveyCreateRoutes = require('./surveyCreate');
const adminPanelRoutes = require("./adminPanel");

app.use(bibleRoutes);
app.use(loginRoutes);
app.use(calendarRoutes);
app.use(chatRoutes);
app.use(prayerWallRoutes);
app.use(profileRoutes);
app.use(surveyRoutes);
app.use(adminPanelRoutes);

// Serve HTML files explicitly (improving clarity)
// Corrected explicit HTML routes:
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../views/profile.html')));
app.get('/calendar', (req, res) => res.sendFile(path.join(__dirname, '../views/calendar.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, '../views/chat.html')));
app.get('/orgFinder', (req, res) => res.sendFile(path.join(__dirname, '../views/orgFinder.html')));
app.get('/prayerWall', (req, res) => res.sendFile(path.join(__dirname, '../views/prayerwall.html')));
app.get('/survey', (req, res) => res.sendFile(path.join(__dirname, '../views/survey.html')));
app.get('/surveyCreate', (req, res) => res.sendFile(path.join(__dirname, '../views/surveyCreate.html')));
app.get('/landing', (req, res) => res.sendFile(path.join(__dirname, '../views/landing.html')));
app.get('/adminPanel', (req, res) => res.sendFile(path.join(__dirname, '../views/adminPanel.html')));




// API endpoint for current user (testing purposes)
app.get('/api/user', (req, res) => {
  res.json(req.session.user || null);
});

// Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
