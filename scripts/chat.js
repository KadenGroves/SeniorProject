const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const router = express.Router();
const db = require('./db');

router.get('/chat', (req, res) => {
  if (req.session.user == null) {
    res.redirect('/login');
    return;
  }

  const sql = `SELECT * FROM chat_rooms`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to retrieve chat threads:", err);
      return res.status(500).json({ error: "Failed to retrieve chat threads" });
    }
    res.render('chat', { 
      threads: results,
      messages: null
    });
  });
});

router.post('/createThread', (req, res) => {
  const { name, description } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: "You must be logged in to create a thread." });
  }

  if (!name) {
    return res.status(400).json({ error: "A name and description are required for the thread." });
  }

  const sql = "INSERT INTO chat_rooms (name, description, created_by) VALUES (?, ?, ?)";
  db.query(sql, [name, description, user.id], (err) => {
    if (err) {
      console.error("Failed to create thread:", err);
      return res.status(500).json({ error: "Failed to create thead" });
    }
    res.redirect('/chat');
  });
});

router.post('/deleteThread', (req, res) => {
  const {deleteOne, deleteTwo} = req.body;
  const user = req.session.user;

  if (deleteOne != deleteTwo) {
    return res.status(501).json({ error: "Both inputs must be equal" });
  }

  if (!user) {
    return res.status(401).json({ error: "You must be logged in to delete a thread." });
  }

  const sql = "DELETE FROM chat_rooms WHERE name = ?";
  db.query(sql, [deleteOne], (err) => {
    if (err) {
      console.error("Failed to delete thread", err);
      return res.status(502).json({ error: "Failed to delete thead" });
    }
    res.redirect('/chat');
  });
})

router.post('/postMessage', (req, res) => {

})

router.get('/chat/:thread', (req, res) => {
  const thread = req.params.thread;
  
  if (!thread) {
    return res.redirect('/chat');
  }

  const sqlThreads = 'SELECT * FROM chat_rooms';
  const sqlMessages = `
  SELECT message, sender_id 
  FROM chat_messages 
  WHERE room_id = (SELECT id FROM chat_rooms WHERE name = ?);`;

  db.query(sqlMessages, [thread], (err, messageResults) => {
    if (err) {
      console.error('Error retrieving previous messages', err);
      return res.status(505).send('Error retrieving previous messages');
    }

    db.query(sqlThreads, (err, threadResults) => {
      if (err) {
        console.error('Failed to retrieve chat threads', err);
        res.status(500).send('Failed to retrieve chat threads');
      }

      res.render('chat.ejs', {
        threads: threadResults,
        messages: messageResults
      });
    })

  })

})

module.exports = router;