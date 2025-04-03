const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('./db');
const { log } = require('console');


// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;

let SURVEYID;

function deleteQuestion(qId) {
    const sql = `
        DELETE FROM survey_questions
        WHERE id = ${qId}; `
    db.query(sql, (err, results) => {
        if (err) {
        console.error("Failed to retrieve data:", err);
        return res.status(500).json({ error: "Failed to retrieve data" });
        }
        res.render('surveyCreate', { surveys : results });
    });
}

router.get('/survey', (req, res) => {
    if (req.session.user == null) {
        res.redirect('/login');
        return;
    }


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
        res.sendFile(path.join(__dirname, '../views/survey.html'));
    });
});

router.post('/surveyForm', (req, res) => {
    // console.log("begin submit");
    const z = req.body;
    // console.log(z);
    SURVEYID = z.surveyId;

    // console.log("inputing into database responses");
    const sql = "INSERT INTO survey_responses (survey_id, responder, res_phone, res_year, res_major, surveyor_id) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [z.surveyId, z.name, z.phone, z.year, z.major, 1], (err) => {
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
                if (key == "surveyId") { console.log("suceessfull survey form fill"); res.redirect('/survey'); 
                    return;
                } else {
                    const value = z[key];
                    // Do something with key and value
                    console.log(`Key: ${key}, Value: ${value}`);
    
                    const sql = "INSERT INTO response_answers (response_id, question_id, answer_text) VALUES (?, ?, ?)";
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

router.post('/addQuestion', (req, res) => {
    const a = req.body;
    console.log(a);
    let boolean = false;

    if (a.option1 == null) {boolean = true}

    const sql = "INSERT INTO survey_questions (survey_id, question_text, question_type) VALUES (?, ?, ?)";
    db.query(sql, [a.surveyId ,a.text, a.type], (err) => {
        if (err) {
            console.error("Failed to add survey question:", err);
            return res.status(500).json({ error: "Failed to add survey question" });
        }
    });

    function getResponseId(callback) {
        const sql2 = `
            SELECT id FROM survey_questions 
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
        for (const key in a) {
            if (a.hasOwnProperty(key)) {
                if (key.startsWith("option")) {  
                    const value = a[key];
                    console.log(`Key: ${key}, Value: ${value}`);

                    const sql = "INSERT INTO question_choices (choice, question_id) VALUES (?, ?)";
                    db.query(sql, [value ,responseId], (err) => {
                        if (err) {
                            console.error("Failed to add survey question:", err);
                            return res.status(500).json({ error: "Failed to add survey question" });
                        }
                    });
                }
            }
        }
        res.redirect('/surveyCreate')
    });
})

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

router.get('/surveyCards', (req, res) => {
    const sql = `
        SELECT survey_responses.*, survey_questions.*, response_answers.*
        FROM response_answers
        JOIN survey_responses ON response_answers.response_id = survey_responses.id
        JOIN survey_questions ON response_answers.question_id = survey_questions.id
        ORDER BY submitted_at DESC;`
    db.query(sql, (err, results) => {
        if (err) {
        console.error("Failed to retrieve data:", err);
        return res.status(500).json({ error: "Failed to retrieve data" });
        }
        res.render('surveyCards', { cards : results });
    });
});

module.exports = router;

