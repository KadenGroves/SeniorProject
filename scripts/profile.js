const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Multer image stuff
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/profilePics"), // profile images will be placed here
    filename: (req, file, cb) => cb(null, req.session.user.id + '.png') // name of image is user's id
});
const upload = multer({ storage });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

function hideEmail(email) {
    const atIndex = email.indexOf('@');
    if (atIndex >= 1) {
        return email[0] + '*****' + email.slice(atIndex);
    }
};


router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Not logged in');
    }

    const userId = req.session.user.id;

    const query = 'SELECT id, username, email, role, created_at, profile_picture FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        user.hiddenEmail = hideEmail(user.email);
        res.render('profile', { user });
    });
});


router.post('/uploadProfileImage', upload.single("image"), (req, res) => {
    const user = req.session.user;

    const imageUrl = req.file ? `/uploads/profilePics/${req.file.filename}` : null;
    // console.log(req.file.filename);
    // console.log(req);
    // console.log(req.file);

    const sql = 'UPDATE users SET profile_picture = ? WHERE id = ?';
    console.log(imageUrl, user.id);
    db.query(sql, [imageUrl, user.id], (err) => {
        if (err) {
            console.error("Failed to replace Image:", err);
            return res.status(500).json({ error: "Failed to replace Image" });
        }
        console.log("successful profile image upload");
        res.redirect('/profile');
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
