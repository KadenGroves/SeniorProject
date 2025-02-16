const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change if needed
    password: 'Password123', // Change if needed
    database: 'ministry_app'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

app.use(bodyParser.json());
app.use(express.static('public'));

// API to fetch all events
app.get('/api/events', (req, res) => {
    const sql = 'SELECT * FROM calendar_events ORDER BY event_date ASC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// API to add a new event
app.post('/api/events', (req, res) => {
    const { title, description, event_date, created_by } = req.body;
    const sql = 'INSERT INTO calendar_events (title, description, event_date, created_by) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, description, event_date, created_by], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Event added successfully!', eventId: result.insertId });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});