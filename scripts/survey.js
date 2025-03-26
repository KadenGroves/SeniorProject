const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('./db');
const { log } = require('console');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// JSDOM.fromURL("your_url").then(dom => {
//     const document = dom.window.document;
//     document.addEventListener("DOMContentLoaded", () => {
//         // Your code to access and manipulate DOM elements goes here
//         const element = document.querySelector("#myElement");
//         if (element) {
//         console.log(element.textContent);
//         }
//     });
//     }).catch(error => {
//     console.error("Error fetching or parsing the page:", error);
// });


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
    // console.log("begin submit");
    const z = req.body;
    // console.log(z);

    // console.log("inputing into database responces");
    const sql = "INSERT INTO survey_responses (survey_id, respondor, res_phone, res_major, surveyor_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [z.surveyId, z.name, z.major, z.year, 1], (err) => {
        if (err) {
            console.error("Failed to submit survey answers:", err);
            return res.status(500).json({ error: "Failed to submit survey answers" });
        }
    });

    function getResponseId(callback) {
        const sql2 = `
            SELECT id FROM survey_responses 
            ORDER BY id DESC
            LIMIT 1;`;
    
        db.query(sql2, (err, results) => {
            if (err) {
                console.error("Failed to get responseId", err);
                return callback(err, null);
            }
            callback(null, results[0].id);  // Pass the result to the callback
        });
    }
    
    getResponseId((err, responseId) => {
        if (err) {
            return res.status(500).json({ error: "Failed to get responseId" });
        }
        // console.log(responseId);  // Now this will log after the query finishes
        for (const key in z) {
            if (z.hasOwnProperty(key)) {
                if (key == "surveyId") { console.log("suceessfull survey form fill"); res.redirect('/survey'); return;} else {
                    const value = z[key];
                    // Do something with key and value
                    // console.log(`Key: ${key}, Value: ${value}`);
    
                    const sql = "INSERT INTO responce_answers (response_id, question_id, answer_text) VALUES (?, ?, ?)";
                    db.query(sql, [responseId, parseInt(key), value], (err) => {
                        if (err) {
                            console.error("Failed to submit answers:", err);
                            return res.status(500).json({ error: "Failed to submit answers" });
                        }
                    });
                }
            }
        }
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