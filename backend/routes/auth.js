const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Unified login for all roles (Admin, Teacher, Parent, Student)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  try {
    const db = await getDB();
    
    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Retrieve role-specific details to include in session
    let profile = { email: user.email, role: user.role };
    if (user.role === 'teacher') {
      const teacher = await db.get('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
      if (teacher) {
        profile.name = teacher.name;
        profile.teacher_id = teacher.id;
        profile.phone = teacher.phone;
      }
    } else if (user.role === 'parent') {
      const parent = await db.get('SELECT * FROM parents WHERE user_id = ?', [user.id]);
      if (parent) {
        profile.name = parent.name;
        profile.parent_id = parent.id;
        profile.phone = parent.phone;
        
        // Fetch children
        const children = await db.all('SELECT id, name, admission_no FROM students WHERE parent_id = ?', [parent.id]);
        profile.children = children;
      }
    } else if (user.role === 'student') {
      const student = await db.get(
        `SELECT s.*, c.name as class_name 
         FROM students s 
         LEFT JOIN classes c ON s.class_id = c.id 
         WHERE s.user_id = ?`, 
        [user.id]
      );
      if (student) {
        profile.name = student.name;
        profile.student_id = student.id;
        profile.admission_no = student.admission_no;
        profile.class_id = student.class_id;
        profile.class_name = student.class_name;
      }
    } else if (user.role === 'admin') {
      profile.name = 'School Administrator';
    }

    // Sign token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, profile },
      process.env.JWT_SECRET || 'smartschool_lk_srilankan_digital_school_jwt_secret_2026_key',
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// Check current user session / token validity
router.get('/me', authenticateToken, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
