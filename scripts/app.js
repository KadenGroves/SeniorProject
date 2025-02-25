require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express(); 
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const loginRoutes = require('./login');
const prayerWallRoutes = require('./prayerWall');
const bibleRoutes = require('./bible');

app.use(loginRoutes);
app.use(prayerWallRoutes);
app.use(bibleRoutes);




app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/profile', (req, res) => {
  res.render('profile.ejs');
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

app.get('/survey', (req, res) => {
  res.render('survey.ejs');
});

app.get('/landing', (req, res) => {
  res.render('landing.ejs');
});


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));