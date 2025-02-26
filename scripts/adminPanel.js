const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const db = require('./db');

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();  // User is admin, proceed
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
}

router.get('/adminPanel', isAdmin, (req, res) => {
    const query = 'SELECT id, username, email, role, created_at FROM users';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }

        res.render('adminPanel.ejs', { users: results });
    });
});

module.exports = router;
