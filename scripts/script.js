const express = require('express')
const app = express()
app.set('view-engine', 'ejs')

// This alows the ejs files to recognize CSS styling in the public folder
var path = require('path')
app.use(express.static('../public'))
app.use(express.static(path.join(__dirname, "../public")))


app.listen(3000)

app.get('/', (req,res) => {
    res.render('index.ejs')
})

app.get('/calendar', (req,res) => {
    res.render('calendar.ejs')
})

app.get('/chat', (req,res) => {
    res.render('chat.ejs')
})

app.get('/login', (req,res) => {
    res.render('login.ejs')
})

app.get('/orgFinder', (req,res) => {
    res.render('orgFinder.ejs')
})

app.get('/prayerWall', (req,res) => {
    res.render('prayerWall.ejs')
})

app.get('/profile', (req,res) => {
    res.render('profile.ejs')
})

app.get('/survey', (req,res) => {
    res.render('survey.ejs')
})



