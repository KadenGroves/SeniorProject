const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('./db');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));
router.get('/survey', (req, res) => {
    const sql = `
        SELECT surveys.*, survey_questions.*, questions_choices.*
        FROM surveys
        JOIN survey_questions ON surveys.id = survey_questions.survey_id
        JOIN questions_choices ON survey_questions.id = questions_choices.question_id;`
    db.query(sql, (err, results) => {
        if (err) {
        console.error("Failed to retrieve data:", err);
        return res.status(500).json({ error: "Failed to retrieve data" });
        }
        res.render('survey', { surveys: results });
    });
});

/*
router.post('/PrayerWall', upload.single("image"), (req, res) => {
    const { title, description } = req.body;
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ error: "You must be logged in to post a prayer request." });
    }

    const authorId = user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required." });
    }

    const sql = "INSERT INTO prayer_wall (title, description, author_id, image_url) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, description, authorId, imageUrl], (err) => {
        if (err) {
            console.error("Failed to submit prayer request:", err);
            return res.status(500).json({ error: "Failed to submit prayer request" });
        }
        res.redirect('/PrayerWall');
    });
});
*/

module.exports = router;