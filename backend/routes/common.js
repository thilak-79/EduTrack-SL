const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Fetch notice board circulars filtered by user role audience
router.get('/notices', authenticateToken, async (req, res) => {
  const { role } = req.user;

  try {
    const db = await getDB();
    let query = 'SELECT * FROM notices ';
    let params = [];

    // Filter notices based on role. Admins see everything.
    if (role === 'teacher') {
      query += "WHERE target_audience IN ('All', 'Teachers') ";
    } else if (role === 'parent') {
      query += "WHERE target_audience IN ('All', 'Parents') ";
    } else if (role === 'student') {
      query += "WHERE target_audience IN ('All', 'Students') ";
    }

    query += 'ORDER BY date DESC, created_at DESC';

    const notices = await db.all(query, params);
    return res.json(notices);
  } catch (error) {
    console.error('Fetch notices error:', error);
    return res.status(500).json({ error: 'Server error while fetching notices.' });
  }
});

// Fetch system message delivery history (for SMS/Email status audits)
router.get('/messages/history', authenticateToken, async (req, res) => {
  try {
    const db = await getDB();
    
    // Admins can see all message logs. Teachers can see messages they sent. 
    // Parents see messages received. Students see in-app notifications.
    let query = `
      SELECT m.*, u_send.email as sender_email, u_recv.email as receiver_email, s.name as student_name
      FROM messages m
      LEFT JOIN users u_send ON m.sender_id = u_send.id
      LEFT JOIN users u_recv ON m.receiver_id = u_recv.id
      LEFT JOIN students s ON m.student_id = s.id
    `;
    let params = [];

    if (req.user.role === 'teacher') {
      query += ' WHERE m.sender_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' WHERE m.receiver_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'student') {
      // Students fetch notifications directed to their parent, concerning them
      const student = await db.get('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (student) {
        query += ' WHERE m.student_id = ?';
        params.push(student.id);
      } else {
        return res.json([]);
      }
    }
    
    query += ' ORDER BY m.created_at DESC';

    const messages = await db.all(query, params);
    return res.json(messages);
  } catch (error) {
    console.error('Fetch message history error:', error);
    return res.status(500).json({ error: 'Server error while fetching notification logs.' });
  }
});

module.exports = router;
