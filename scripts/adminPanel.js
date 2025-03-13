const express = require('express');
const router = express.Router();
const db = require('./db');

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();  // User is admin, proceed
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
}

function isStaff(req, res, next) {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'staff')) {
        next();
    } else {
        res.status(403).send('Access denied. Staff only.');
    }
}

router.get('/adminPanel', isAdmin, isStaff, (req, res) => {
    if (req.session.user == null) {
        res.redirect('/login')
        return;
    }

    const query = 'SELECT id, username, email, role, created_at FROM users';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }

        res.render('adminPanel.ejs', {
            users: results,
            currentUser: req.session.user,
            searchUser: null,   
            searchPerformed: false  
        });
    });
});

router.post('/adminPanel/promote/:id', isStaff, (req, res) => {
    const userId = req.params.id;
    
    const getUserQuery = 'SELECT role FROM users WHERE id = ?';
    db.query(getUserQuery, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).send('Error finding user.');
        }

        let currentRole = results[0].role;
        let newRole = '';

        if (currentRole === 'user') {
            newRole = 'studentleader';
        } else if (currentRole === 'studentleader') {
            newRole = 'staff';
        } else if (currentRole === 'staff') {
            if (req.session.user.role === 'admin') {
                newRole = 'admin';
            } else {
                return res.status(403).send('Only admins can promote staff to admin.');
            }
        } else if (currentRole === 'admin') {
            newRole = 'staff';
        } else {
            return res.status(400).send('Invalid role transition.');
        }

        const updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
        db.query(updateQuery, [newRole, userId], (err) => {
            if (err) {
                return res.status(500).send('Error updating user role.');
            }
            res.redirect('/adminPanel');
        });
    });
});

// Demote User (Staff can demote up to staff)
router.post('/adminPanel/demote/:id', isStaff, (req, res) => {
    const userId = req.params.id;

    const getUserQuery = 'SELECT role FROM users WHERE id = ?';
    db.query(getUserQuery, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).send('Error finding user.');
        }

        let currentRole = results[0].role;
        let newRole = '';

        if (currentRole === 'staff') {
            newRole = 'studentleader';
        } else if (currentRole === 'studentleader') {
            newRole = 'user';
        } else {
            return res.status(400).send('Cannot demote this user.');
        }

        const updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
        db.query(updateQuery, [newRole, userId], (err) => {
            if (err) {
                return res.status(500).send('Error updating user role.');
            }
            res.redirect('/adminPanel');
        });
    });
});

// Delete User (Admins and Staff can delete users, but Admins cannot delete themselves)
router.post('/adminPanel/delete/:id', isStaff, (req, res) => {
    const userId = req.params.id;

    const getUserQuery = 'SELECT role FROM users WHERE id = ?';
    db.query(getUserQuery, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).send('Error finding user.');
        }

        if (results[0].role === 'admin') {
            return res.status(403).send('Admins cannot delete themselves.');
        }

        const deleteQuery = 'DELETE FROM users WHERE id = ?';
        db.query(deleteQuery, [userId], (err) => {
            if (err) {
                return res.status(500).send('Error deleting user.');
            }
            res.redirect('/adminPanel');
        });
    });
});

//User search
router.get('/adminPanel/search', isStaff, (req, res) => {
    const username = req.query.username;
    if (!username) return res.redirect('/adminPanel');

    const searchQuery = 'SELECT id, username, email, role, created_at FROM users WHERE username = ?';
    const allUsersQuery = 'SELECT id, username, email, role, created_at FROM users';

    db.query(searchQuery, [username], (err, searchResults) => {
        if (err) return res.status(500).send('Error searching user.');
            db.query(allUsersQuery, (err, allUsers) => {
            if (err) return res.status(500).send('Error fetching users.');

            res.render('adminPanel.ejs', {
                users: allUsers,                    
                currentUser: req.session.user,
                searchUser: searchResults[0] || null,
                searchPerformed: true
            });
        });
    });
});

module.exports = router;