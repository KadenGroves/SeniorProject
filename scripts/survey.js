const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('./db');




router.get('/survey', (req, res) => {
    const sql = `
        SELECT surveys.*, survey_questions.*, 
        COALESCE(question_choices.question_id, survey_questions.id) AS question_id
        FROM surveys
        JOIN survey_questions ON surveys.id = survey_questions.survey_id
        LEFT JOIN question_choices ON survey_questions.id = question_choices.question_id;`
    db.query(sql, (err, results) => {
        if (err) {
        console.error("Failed to retrieve data:", err);
        return res.status(500).json({ error: "Failed to retrieve data" });
        }
        res.render('survey', { surveys : results });
    });
});

module.exports = router;