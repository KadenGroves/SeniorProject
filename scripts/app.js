require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
// const bcrypt = require('bcrypt');
const app = express(); 

const session = require('express-session');


app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

//makes user avaliable in all views
app.use((req, res, next) => {
  if (req.session.user) {
    const userId = req.session.user.id;
    db.query('SELECT username, profile_picture FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return next();
      }
      
      if (results.length > 0) {
        req.session.user.username = results[0].username;
        req.session.user.profile_picture = results[0].profile_picture || '/uploads/default-profile.png';
      } else {
        req.session.user.profile_picture = '/uploads/default-profile.png';
      }
      
      res.locals.user = req.session.user;
      next();
    });
  } else {
    res.locals.user = null;
    next();
  }
});

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const loginRoutes = require('./login');
const prayerWallRoutes = require('./prayerWall');
const bibleRoutes = require('./bible');
const adminPanelRoutes = require('./adminPanel');
const surveyRoutes = require('./survey');
// const surveyCreateRoutes = require('./surveyCreate');
const profileRoutes = require('./profile');
const chatRoutes = require('./chat');

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; 
  next();
});


app.use(loginRoutes);
app.use(prayerWallRoutes);
app.use(bibleRoutes);
app.use(adminPanelRoutes);
app.use(profileRoutes);
// app.use(surveyRoutes);
app.use(surveyRoutes);
// app.use(surveyCreateRoutes);
app.use(chatRoutes)

app.get('/', (req, res) => {
  console.log(req.session.user.id);
  res.render('home.ejs', {user: req.session.user || null});
});

app.get('/profile', (req, res) => {
  res.render('profile.ejs', {user: req.session.user || null});
});

app.get('/calendar', (req, res) => {
  res.render('calendar.ejs', {user: req.session.user || null});
});

app.get('/chat', (req, res) => {
  res.render('chat.ejs', {user: req.session.user || null});
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {user: req.session.user || null});
});

app.get('/orgFinder', (req, res) => {
  res.render('orgFinder.ejs', {user: req.session.user || null});
});

app.get('/prayerWall', (req, res) => {
  res.render('prayerWall.ejs', {user: req.session.user || null});
});

app.get('/survey', (req, res) => {
  res.render('survey.ejs', {user: req.session.user || null});
});

app.get('/surveyCreate', (req, res) => {
  res.render('surveyCreate.ejs', {user: req.session.user || null});
});

app.get('/landing', (req, res) => {
  res.render('landing.ejs', {user: req.session.user || null});
});

app.get('/adminPanel', (req, res) => {
  res.render('adminPanel.ejs', {user: req.session.user || null});
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));