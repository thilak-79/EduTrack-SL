const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all student endpoints
router.use(authenticateToken, requireRole('student'));

// Get personal attendance logs and summary percentages
router.get('/dashboard', async (req, res) => {
  const studentId = req.user.profile.student_id;

  if (!studentId) {
    return res.status(400).json({ error: 'Student profile not associated with this account.' });
  }

  try {
    const db = await getDB();
    
    // Fetch student data
    const student = await db.get(`
      SELECT s.*, c.name as class_name, p.name as parent_name, p.phone as parent_phone
      FROM students s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN parents p ON s.parent_id = p.id
      WHERE s.id = ?
    `, [studentId]);

    // Fetch personal attendance logs
    const logs = await db.all(`
      SELECT a.*, sub.name as subject_name, t.name as teacher_name
      FROM attendance a
      LEFT JOIN subjects sub ON a.subject_id = sub.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 30
    `, [studentId]);

    // Summarize logs
    const allLogs = await db.all('SELECT status FROM attendance WHERE student_id = ?', [studentId]);
    const total = allLogs.length;
    const present = allLogs.filter(l => l.status === 'Present').length;
    const late = allLogs.filter(l => l.status === 'Late').length;
    const absent = allLogs.filter(l => l.status === 'Absent').length;

    const attendancePct = total > 0 
      ? Math.round(((present + late) / total) * 100)
      : 100;

    return res.json({
      profile: student,
      attendance: {
        recent_logs: logs,
        summary: {
          total,
          present,
          late,
          absent,
          attendance_percentage: attendancePct
        }
      }
    });

  } catch (error) {
    console.error('Fetch student dashboard error:', error);
    return res.status(500).json({ error: 'Server error while loading student profile.' });
  }
});

// Get personal exam marks and grade progression
router.get('/results', async (req, res) => {
  const studentId = req.user.profile.student_id;

  if (!studentId) {
    return res.status(400).json({ error: 'Student profile not associated with this account.' });
  }

  try {
    const db = await getDB();
    
    // Fetch result logs
    const results = await db.all(`
      SELECT r.*, sub.name as subject_name, t.name as teacher_name
      FROM results r
      JOIN subjects sub ON r.subject_id = sub.id
      LEFT JOIN teachers t ON r.teacher_id = t.id
      WHERE r.student_id = ?
      ORDER BY r.exam_term ASC, sub.name ASC
    `, [studentId]);

    // Group by term
    const grouped = {};
    const terms = ['Term 1', 'Term 2', 'Term 3', 'Assignment', 'Final Exam'];
    terms.forEach(t => { grouped[t] = []; });

    results.forEach(r => {
      if (grouped[r.exam_term]) {
        grouped[r.exam_term].push(r);
      }
    });

    // Term averages
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
    console.error('Fetch student results error:', error);
    return res.status(500).json({ error: 'Server error loading report cards.' });
  }
});

module.exports = router;
