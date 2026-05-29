const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all parent endpoints
router.use(authenticateToken, requireRole('parent'));

// Security helper: Verify student is parent's child
async function verifyChildRelation(db, parentUserId, studentId) {
  const parent = await db.get('SELECT id FROM parents WHERE user_id = ?', [parentUserId]);
  if (!parent) return false;
  
  const student = await db.get('SELECT id FROM students WHERE id = ? AND parent_id = ?', [studentId, parent.id]);
  return !!student;
}

// Get all children linked to this parent profile
router.get('/children', async (req, res) => {
  const parentId = req.user.profile.parent_id;

  if (!parentId) {
    return res.status(400).json({ error: 'Parent profile not found.' });
  }

  try {
    const db = await getDB();
    const children = await db.all(`
      SELECT s.*, c.name as class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.parent_id = ?
      ORDER BY s.name ASC
    `, [parentId]);

    return res.json(children);
  } catch (error) {
    console.error('Fetch parent children error:', error);
    return res.status(500).json({ error: 'Server error while fetching student profiles.' });
  }
});

// Get detailed child attendance records and summary metrics
router.get('/attendance/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const db = await getDB();
    
    // Verify child link
    const isChild = await verifyChildRelation(db, req.user.id, studentId);
    if (!isChild) {
      return res.status(403).json({ error: 'Unauthorized: Student is not linked to your profile.' });
    }

    // Fetch attendance logs
    const logs = await db.all(`
      SELECT a.*, sub.name as subject_name, t.name as teacher_name
      FROM attendance a
      LEFT JOIN subjects sub ON a.subject_id = sub.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
    `, [studentId]);

    // Calculate summaries
    const total = logs.length;
    const present = logs.filter(l => l.status === 'Present').length;
    const late = logs.filter(l => l.status === 'Late').length;
    const absent = logs.filter(l => l.status === 'Absent').length;
    
    const attendancePct = total > 0 
      ? Math.round(((present + late) / total) * 100)
      : 100; // default 100% if no logs yet

    return res.json({
      logs,
      summary: {
        total,
        present,
        late,
        absent,
        attendance_percentage: attendancePct
      }
    });

  } catch (error) {
    console.error('Fetch parent child attendance error:', error);
    return res.status(500).json({ error: 'Server error fetching child attendance data.' });
  }
});

// Get child report card with exam term aggregates, grades, and class ranks
router.get('/results/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const db = await getDB();
    
    // Verify child link
    const isChild = await verifyChildRelation(db, req.user.id, studentId);
    if (!isChild) {
      return res.status(403).json({ error: 'Unauthorized: Student is not linked to your profile.' });
    }

    // Fetch result logs
    const results = await db.all(`
      SELECT r.*, sub.name as subject_name, t.name as teacher_name
      FROM results r
      JOIN subjects sub ON r.subject_id = sub.id
      LEFT JOIN teachers t ON r.teacher_id = t.id
      WHERE r.student_id = ?
      ORDER BY r.exam_term ASC, sub.name ASC
    `, [studentId]);

    // Group scores by exam term
    const grouped = {};
    const terms = ['Term 1', 'Term 2', 'Term 3', 'Assignment', 'Final Exam'];
    
    terms.forEach(t => {
      grouped[t] = [];
    });

    results.forEach(r => {
      if (grouped[r.exam_term]) {
        grouped[r.exam_term].push(r);
      }
    });

    // Calculate term averages
    const termSummaries = {};
    terms.forEach(t => {
      const records = grouped[t];
      if (records.length > 0) {
        const totalMarks = records.reduce((sum, r) => sum + r.marks, 0);
        const avgMarks = totalMarks / records.length;
        
        termSummaries[t] = {
          total_subjects: records.length,
          total_marks: totalMarks,
          average: Math.round(avgMarks * 100) / 100,
          gpa_grade: avgMarks >= 75 ? 'A' : avgMarks >= 65 ? 'B' : avgMarks >= 55 ? 'C' : avgMarks >= 35 ? 'S' : 'F'
        };
      } else {
        termSummaries[t] = null;
      }
    });

    return res.json({
      results: grouped,
      summaries: termSummaries
    });

  } catch (error) {
    console.error('Fetch parent child results error:', error);
    return res.status(500).json({ error: 'Server error fetching child report cards.' });
  }
});

// Fetch messaging inbox for parent (messages received concerning any child)
router.get('/messages', async (req, res) => {
  const parentId = req.user.profile.parent_id;

  if (!parentId) {
    return res.status(400).json({ error: 'Parent profile not found.' });
  }

  try {
    const db = await getDB();
    
    const messages = await db.all(`
      SELECT m.*, u.email as sender_email, t.name as sender_name, s.name as student_name
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON m.student_id = s.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [req.user.id]);

    return res.json(messages);
  } catch (error) {
    console.error('Fetch parent inbox error:', error);
    return res.status(500).json({ error: 'Server error while fetching parent inbox.' });
  }
});

module.exports = router;
