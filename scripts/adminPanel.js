const express = require('express');
const router = express.Router();
const db = require('./db');
const path = require('path');

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
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

router.get('/adminPanel', isStaff, (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '../views/adminPanel.html'));
});

router.get('/api/admin/users', isStaff, (req, res) => {
  const query = 'SELECT id, username, email, role, created_at FROM users';
  db.query(query, (err, users) => {
    if (err) return res.status(500).send('Error fetching users');

    users = users.map(user => {
      user.actionButtons = renderActions(req.session.user, user);
      return user;
    });

    res.json(users);
  });
});

router.get('/api/admin/search', isStaff, (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).send('Username required');

  const searchQuery = 'SELECT id, username, email, role, created_at FROM users WHERE username = ?';

  db.query(searchQuery, [username], (err, results) => {
    if (err) return res.status(500).send('Error searching user');
    const user = results[0];
    if (user) user.actionButtons = renderActions(req.session.user, user);
    res.json({ user });
  });
});

function renderActions(currentUser, user) {
  if (user.id === currentUser.id && user.role === 'admin') return '';
  let buttons = '';
  const form = (path, label, confirm = false) => `
    <form action="/adminPanel/${path}/${user.id}" method="POST" style="display:inline;">
      <button type="submit"${confirm ? " onclick=\"return confirm('Are you sure?')\"" : ''}>${label}</button>
    </form>`;

  if (currentUser.role === 'admin') {
    if (user.role === 'user') {
      buttons += form('promote', 'Promote to Student Leader');
    } else if (user.role === 'studentleader') {
      buttons += form('promote', 'Promote to Staff');
      buttons += form('demote', 'Demote to User');
    } else if (user.role === 'staff') {
      buttons += form('demote', 'Demote to Student Leader');
    }
    if (user.role !== 'admin') {
      buttons += form('delete', 'Delete', true);
    }
  } else if (currentUser.role === 'staff') {
    if (user.role === 'user') {
      buttons += form('promote', 'Promote to Student Leader');
      buttons += form('delete', 'Delete', true);
    } else if (user.role === 'studentleader') {
      buttons += form('demote', 'Demote to User');
      buttons += form('delete', 'Delete', true);
    }
  }

  return buttons;
}

router.post('/adminPanel/promote/:id', isStaff, (req, res) => {
  const userId = req.params.id;
  const currentUser = req.session.user;

  db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Error finding user.');

    const currentRole = results[0].role;
    let newRole = '';

    if (currentRole === 'user') {
      newRole = 'studentleader';
    } else if (currentRole === 'studentleader') {
      if (currentUser.role === 'admin') {
        newRole = 'staff';
      } else {
        return res.status(403).send('Only admins can promote to staff.');
      }
    } else if (currentRole === 'staff') {
      if (currentUser.role === 'admin') {
        newRole = 'admin';
      } else {
        return res.status(403).send('Only admins can promote to admin.');
      }
    } else {
      return res.status(400).send('Invalid promotion.');
    }

    db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId], err => {
      if (err) return res.status(500).send('Error updating user role.');
      res.redirect('/adminPanel');
    });
  });
});

router.post('/adminPanel/demote/:id', isStaff, (req, res) => {
  const userId = req.params.id;
  const currentUser = req.session.user;

  db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Error finding user.');

    const currentRole = results[0].role;
    let newRole = '';

    if (currentRole === 'staff') {
      if (currentUser.role !== 'admin') return res.status(403).send('Only admins can demote staff.');
      newRole = 'studentleader';
    } else if (currentRole === 'studentleader') {
      newRole = 'user';
    } else {
      return res.status(400).send('Cannot demote this user.');
    }

    db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId], err => {
      if (err) return res.status(500).send('Error updating user role.');
      res.redirect('/adminPanel');
    });
  });
});

router.post('/adminPanel/delete/:id', isStaff, (req, res) => {
  const userId = req.params.id;
  const currentUser = req.session.user;

  db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) return res.status(500).send('Error finding user.');

    const targetRole = results[0].role;

    if (targetRole === 'admin') return res.status(403).send('Admins cannot delete other admins.');
    if (targetRole === 'staff' && currentUser.role !== 'admin') return res.status(403).send('Only admins can delete staff.');

    db.query('DELETE FROM users WHERE id = ?', [userId], err => {
      if (err) return res.status(500).send('Error deleting user.');
      res.redirect('/adminPanel');
    });
  });
});

module.exports = router;