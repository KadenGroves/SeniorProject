const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('./db');
const { log } = require('console');


// const userId = req.session.user.id;


router.get('/survey', (req, res) => {
    const sql = `
        SELECT surveys.*, survey_questions.*, question_choices.*,
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

router.post('/surveyForm', (req, res) => {
    console.log("begin submit");
    
    const all = req.body;

    console.log(all);

    for (const key in all) {
        if (all.hasOwnProperty(key)) {
            if (key == "surveyId") {} else {
                const value = all[key];
                // Do something with key and value
                console.log(`Key: ${key}, Value: ${value}`);
            }
        }
    }

    console.log("inputing into database responces");
    const sql = "INSERT INTO survey_responses (survey_id, respondor, res_phone, res_major, surveyor_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [all.surveyId, all.name, all.major, all.year, 1], (err) => {
    if (err) {
        console.error("Failed to submit survey answers:", err);
        return res.status(500).json({ error: "Failed to submit survey answers" });
    }
    res.redirect('/PrayerWall');
    });
});

router.get('/surveyCreate', (req, res) => {
    const sql = `
        SELECT surveys.*, survey_questions.*, question_choices.*,
        COALESCE(question_choices.question_id, survey_questions.id) AS question_id
        FROM surveys
        JOIN survey_questions ON surveys.id = survey_questions.survey_id
        LEFT JOIN question_choices ON survey_questions.id = question_choices.question_id;`
    db.query(sql, (err, results) => {
        if (err) {
        console.error("Failed to retrieve data:", err);
        return res.status(500).json({ error: "Failed to retrieve data" });
        }
        res.render('surveyCreate', { surveys : results });
    });
});

module.exports = router;