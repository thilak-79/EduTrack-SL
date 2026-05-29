const express = require('express');
const router = express.Router();
const { getDB, calculateGrade } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all teacher endpoints
router.use(authenticateToken, requireRole('teacher'));

// ================= TEACHER DASHBOARD =================

// Fetch dashboard data for the logged-in teacher
router.get('/dashboard', async (req, res) => {
  const teacherId = req.user.profile.teacher_id;

  if (!teacherId) {
    return res.status(400).json({
      error: 'Teacher profile not associated with this account.'
    });
  }

  try {
    const db = await getDB();

    // Get teacher profile
    const teacher = await db.get(
      'SELECT id, name, phone, email FROM teachers WHERE id = ?',
      [teacherId]
    );

    if (!teacher) {
      return res.status(404).json({
        error: 'Teacher profile not found.'
      });
    }

    // Get assigned classes and subjects
    const assignedSubjects = await db.all(`
      SELECT 
        cs.id as mapping_id,
        c.id as class_id,
        c.name as class_name,
        s.id as subject_id,
        s.name as subject_name
      FROM class_subjects cs
      JOIN classes c ON cs.class_id = c.id
      JOIN subjects s ON cs.subject_id = s.id
      WHERE cs.teacher_id = ?
      ORDER BY c.name ASC, s.name ASC
    `, [teacherId]);

    // Count assigned classes
    const classCountRow = await db.get(`
      SELECT COUNT(DISTINCT class_id) as total_classes
      FROM class_subjects
      WHERE teacher_id = ?
    `, [teacherId]);

    // Count assigned subjects
    const subjectCountRow = await db.get(`
      SELECT COUNT(DISTINCT subject_id) as total_subjects
      FROM class_subjects
      WHERE teacher_id = ?
    `, [teacherId]);

    // Count results entered by this teacher
    const resultsCountRow = await db.get(`
      SELECT COUNT(*) as total_results
      FROM results
      WHERE teacher_id = ?
    `, [teacherId]);

    // Count attendance records marked by this teacher
    const attendanceCountRow = await db.get(`
      SELECT COUNT(*) as total_attendance_records
      FROM attendance
      WHERE teacher_id = ?
    `, [teacherId]);

    return res.json({
      teacher,
      assignedSubjects,
      stats: {
        total_classes: classCountRow.total_classes || 0,
        total_subjects: subjectCountRow.total_subjects || 0,
        total_results: resultsCountRow.total_results || 0,
        total_attendance_records: attendanceCountRow.total_attendance_records || 0
      }
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return res.status(500).json({
      error: 'Server error while loading teacher dashboard.'
    });
  }
});

// Fetch classes and subjects assigned to the logged-in teacher
router.get('/classes', async (req, res) => {
  const teacherId = req.user.profile.teacher_id;

  if (!teacherId) {
    return res.status(400).json({ error: 'Teacher profile not associated with this account.' });
  }

  try {
    const db = await getDB();
    const mappings = await db.all(`
      SELECT cs.id as mapping_id, c.id as class_id, c.name as class_name, s.id as subject_id, s.name as subject_name
      FROM class_subjects cs
      JOIN classes c ON cs.class_id = c.id
      JOIN subjects s ON cs.subject_id = s.id
      WHERE cs.teacher_id = ?
      ORDER BY c.name ASC, s.name ASC
    `, [teacherId]);

    return res.json(mappings);
  } catch (error) {
    console.error('Fetch teacher classes error:', error);
    return res.status(500).json({ error: 'Server error while fetching assigned classes.' });
  }
});

// Fetch attendance roster for marking/viewing
router.get('/attendance', async (req, res) => {
  const { class_id, subject_id, date } = req.query;

  if (!class_id || !date) {
    return res.status(400).json({ error: 'Class ID and Date are required.' });
  }

  try {
    const db = await getDB();

    // Fetch all students in the class
    const students = await db.all(
      'SELECT id, admission_no, name FROM students WHERE class_id = ? ORDER BY name ASC',
      [class_id]
    );

    // Fetch marked attendance for these students on this date & subject
    const query = subject_id 
      ? 'SELECT student_id, status FROM attendance WHERE class_id = ? AND date = ? AND subject_id = ?'
      : 'SELECT student_id, status FROM attendance WHERE class_id = ? AND date = ? AND subject_id IS NULL';
    const params = subject_id ? [class_id, date, subject_id] : [class_id, date];
    const attendanceLogs = await db.all(query, params);

    // Map marked status to students list
    const roster = students.map(s => {
      const log = attendanceLogs.find(l => l.student_id === s.id);
      return {
        ...s,
        status: log ? log.status : '' // Present, Absent, Late, or empty if not marked
      };
    });

    return res.json(roster);

  } catch (error) {
    console.error('Fetch attendance error:', error);
    return res.status(500).json({ error: 'Server error while fetching attendance sheet.' });
  }
});

// Mark and save attendance sheet (creates absence alerts in background)
router.post('/attendance', async (req, res) => {
  const { class_id, subject_id, date, records } = req.body;
  const teacherId = req.user.profile.teacher_id;

  if (!class_id || !date || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid or missing attendance payload.' });
  }

  try {
    const db = await getDB();

    for (const record of records) {
      const { student_id, status } = record;
      if (!student_id || !status) continue;

      // Check if entry already exists
      const existingQuery = subject_id
        ? 'SELECT id, status FROM attendance WHERE student_id = ? AND date = ? AND subject_id = ?'
        : 'SELECT id, status FROM attendance WHERE student_id = ? AND date = ? AND subject_id IS NULL';
      const existingParams = subject_id ? [student_id, date, subject_id] : [student_id, date];
      const existing = await db.get(existingQuery, existingParams);

      if (existing) {
        // If status changed, update it
        if (existing.status !== status) {
          await db.run('UPDATE attendance SET status = ? WHERE id = ?', [status, existing.id]);
          
          // Trigger absence alert if newly marked absent
          if (status === 'Absent') {
            await triggerAbsenceAlert(db, req.user.id, student_id, date);
          }
        }
      } else {
        // Create new attendance record
        await db.run(
          'INSERT INTO attendance (student_id, class_id, subject_id, teacher_id, date, status) VALUES (?, ?, ?, ?, ?, ?)',
          [student_id, class_id, subject_id || null, teacherId, date, status]
        );

        // Trigger parent absence notification immediately on new Absence entry
        if (status === 'Absent') {
          await triggerAbsenceAlert(db, req.user.id, student_id, date);
        }
      }
    }

    return res.json({ message: 'Attendance sheet submitted and updated successfully.' });

  } catch (error) {
    console.error('Submit attendance error:', error);
    return res.status(500).json({ error: 'Server error during attendance marking.' });
  }
});

// Private helper to dispatch parent alerts on absences
async function triggerAbsenceAlert(db, senderUserId, studentId, date) {
  try {
    // Retrieve student name and parent user details
    const student = await db.get(`
      SELECT s.name as student_name, p.user_id as parent_user_id, p.name as parent_name, p.phone as parent_phone
      FROM students s
      JOIN parents p ON s.parent_id = p.id
      WHERE s.id = ?
    `, [studentId]);

    if (!student || !student.parent_user_id) return;

    const messageContent = `Dear Parent, your child ${student.student_name} was marked absent today (${date}) at SmartSchool LK. Please contact the class teacher if needed.`;

    // 1. Log mock SMS
    await db.run(
      `INSERT INTO messages (sender_id, receiver_id, student_id, message_type, channel, content, status) 
       VALUES (?, ?, ?, 'absence', 'SMS', ?, 'delivered')`,
      [senderUserId, student.parent_user_id, studentId, messageContent]
    );

    // 2. Log mock Email
    await db.run(
      `INSERT INTO messages (sender_id, receiver_id, student_id, message_type, channel, content, status) 
       VALUES (?, ?, ?, 'absence', 'Email', ?, 'delivered')`,
      [senderUserId, student.parent_user_id, studentId, `SmartSchool LK Absence Notification: ${messageContent}`]
    );

    console.log(`Absence alert triggered for student ${student.student_name} to parent ${student.parent_name}.`);

  } catch (err) {
    console.error('Failed to trigger absence alert:', err);
  }
}

// Fetch class results for marking
router.get('/results', async (req, res) => {
  const { class_id, subject_id, exam_term } = req.query;

  if (!class_id || !subject_id || !exam_term) {
    return res.status(400).json({ error: 'Class ID, Subject ID, and Exam Term are required.' });
  }

  try {
    const db = await getDB();

    // Fetch students
    const students = await db.all(
      'SELECT id, admission_no, name FROM students WHERE class_id = ? ORDER BY name ASC',
      [class_id]
    );

    // Fetch entered marks
    const results = await db.all(
      'SELECT student_id, marks, grade, class_rank, subject_rank FROM results WHERE subject_id = ? AND exam_term = ?',
      [subject_id, exam_term]
    );

    // Map marked results to students
    const marksheet = students.map(s => {
      const resVal = results.find(r => r.student_id === s.id);
      return {
        ...s,
        marks: resVal ? resVal.marks : '',
        grade: resVal ? resVal.grade : '',
        class_rank: resVal ? resVal.class_rank : null,
        subject_rank: resVal ? resVal.subject_rank : null
      };
    });

    return res.json(marksheet);

  } catch (error) {
    console.error('Fetch results error:', error);
    return res.status(500).json({ error: 'Server error while fetching results sheet.' });
  }
});

// Save class result marks & automatically recalculate ranks
router.post('/results', async (req, res) => {
  const { class_id, subject_id, exam_term, records } = req.body;
  const teacherId = req.user.profile.teacher_id;

  if (!class_id || !subject_id || !exam_term || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid or missing results payload.' });
  }

  try {
    const db = await getDB();

    // Save/Update results for each student
    for (const record of records) {
      const { student_id, marks } = record;
      if (!student_id || marks === '' || marks === null) continue;

      const marksVal = parseFloat(marks);
      const grade = calculateGrade(marksVal);

      // Check if result entry exists
      const existing = await db.get(
        'SELECT id FROM results WHERE student_id = ? AND subject_id = ? AND exam_term = ?',
        [student_id, subject_id, exam_term]
      );

      if (existing) {
        await db.run(
          'UPDATE results SET marks = ?, grade = ?, teacher_id = ? WHERE id = ?',
          [marksVal, grade, teacherId, existing.id]
        );
      } else {
        await db.run(
          'INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade) VALUES (?, ?, ?, ?, ?, ?)',
          [student_id, subject_id, teacherId, exam_term, marksVal, grade]
        );
      }
    }

    // ================= DYNAMIC RANKINGS CALCULATION =================
    // 1. Recalculate Class/Subject ranks for this exam term & subject
    // Fetch all student marks scored in this class and subject for the exam term
    const scoredList = await db.all(`
      SELECT r.id, r.marks
      FROM results r
      JOIN students s ON r.student_id = s.id
      WHERE s.class_id = ? AND r.subject_id = ? AND r.exam_term = ?
      ORDER BY r.marks DESC
    `, [class_id, subject_id, exam_term]);

    // Rank update loop
    let currentRank = 1;
    for (let i = 0; i < scoredList.length; i++) {
      // Handle tie rankings: if same marks, they share the same rank
      if (i > 0 && scoredList[i].marks < scoredList[i-1].marks) {
        currentRank = i + 1;
      }
      
      await db.run(
        'UPDATE results SET class_rank = ?, subject_rank = ? WHERE id = ?',
        [currentRank, currentRank, scoredList[i].id]
      );
    }

    return res.json({ message: 'Marks submitted and class ranks calculated successfully.' });

  } catch (error) {
    console.error('Submit results error:', error);
    return res.status(500).json({ error: 'Server error during marks entry.' });
  }
});

// Teacher sends direct custom notification to a specific parent
router.post('/messages', async (req, res) => {
  const { student_id, message_type, channel, content } = req.body;

  if (!student_id || !message_type || !channel || !content) {
    return res.status(400).json({ error: 'Please provide student, message type, channel, and message content.' });
  }

  try {
    const db = await getDB();
    
    // Find parent user of the student
    const student = await db.get('SELECT parent_id FROM students WHERE id = ?', [student_id]);
    if (!student || !student.parent_id) {
      return res.status(404).json({ error: 'Student guardian profile not found.' });
    }

    const parent = await db.get('SELECT user_id, name FROM parents WHERE id = ?', [student.parent_id]);
    if (!parent || !parent.user_id) {
      return res.status(404).json({ error: 'Guardian login user account not found.' });
    }

    // Write message dispatch log
    await db.run(
      `INSERT INTO messages (sender_id, receiver_id, student_id, message_type, channel, content, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'delivered')`,
      [req.user.id, parent.user_id, student_id, message_type, channel, content.trim()]
    );

    return res.json({ message: `Message successfully dispatched to parent ${parent.name} via ${channel}.` });

  } catch (error) {
    console.error('Teacher send message error:', error);
    return res.status(500).json({ error: 'Server error during message dispatch.' });
  }
});

module.exports = router;
