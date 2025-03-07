const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not logged in');
    }

    const userId = req.session.user.id;

    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        res.render('profile', { user });  // Pass user, not users
    });
});


router.post('/changePassword', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user.id;

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];

        if (!user.password_hash) {
            console.error('User has no password set in the database.');
            return res.status(500).send('User data is corrupted — no password found.');
        }

        bcrypt.compare(oldPassword, user.password_hash, (err, validPassword) => {
            if (err) {
                console.error('Bcrypt compare error:', err);
                return res.status(500).send('Server error');
            }

            if (!validPassword) {
                return res.status(400).send('Old password is incorrect');
            }

            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Bcrypt hash error:', err);
                    return res.status(500).send('Server error');
                }

                db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId], (err) => {
                    if (err) {
                        console.error('Database update error:', err);
                        return res.status(500).send('Server error');
                    }

                    res.redirect('/profile');
                });
            });
        });
    });
});

module.exports = router;
