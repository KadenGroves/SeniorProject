const express = require('express');
const router = express.Router();
const db = require('./db');
const fs = require('fs');


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

router.post('/postMessage/:name', (req, res) => {
  const {message} = req.body;
  const room = req.params.name;
  const user = req.session.user;

  if (!user) {
    return res.status(402).json({ error: "You must be logged in to post a message." });
  }

  if (!message) {
    return res.status(405).send('Error posting message');
  }

  const sqlMessage = `INSERT INTO chat_messages (room_id, sender_id, message) VALUES (?, ?, ?)`;
  const sqlRoom = `SELECT id FROM chat_rooms WHERE name = ?`;

  db.query(sqlRoom, [room], (err, roomID) => {
    if (err) {
      console.error('Error retrieving room ID', err);
      return res.status(408).send('Error retrieving room ID');
    }

    db.query(sqlMessage, [roomID[0].id, user.id, message], (err, results) => {
      if (err) {
        console.error('Error posting new message', err);
        return res.status(408).send('Error posting new message');
      }
      console.log(`"${message}" successfully recorded in database`);

      
      res.redirect("/chat/:thread");
    })
  }) 
})

router.get('/chat/:thread', (req, res) => {
  const thread = req.params.thread;
  
  if (!thread) {
    return res.redirect('/chat');
  }

  const sqlThreads = 'SELECT * FROM chat_rooms';
  const sqlMessages = `
  SELECT message, sender_id, room_id
  FROM chat_messages 
  WHERE room_id = (SELECT id FROM chat_rooms WHERE name = ?)`;

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
        messages: messageResults,
        threadName: thread
      });
    })

  })

})

module.exports = router;