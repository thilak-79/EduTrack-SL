const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbConnection = null;

// Get SQLite Database Connection
async function getDB() {
  if (dbConnection) return dbConnection;
  
  const dbPath = path.join(__dirname, '..', 'database', 'database.sqlite');
  
  // Ensure database directory exists
  const fs = require('fs');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys support in SQLite
  await dbConnection.run('PRAGMA foreign_keys = ON');
  
  return dbConnection;
}

// Check and Initialize database tables
async function initializeDatabase() {
  const db = await getDB();
  console.log('SmartSchool LK: Initializing SQLite database and checking tables...');

  // 1. Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'teacher', 'parent', 'student')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Classes Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // 3. Subjects Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);

  // 4. Teachers Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Parents Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 6. Students Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      admission_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      dob TEXT NOT NULL,
      class_id INTEGER,
      parent_id INTEGER,
      medical_notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
    );
  `);

  // 7. Class-Subjects Mapping (Assign teachers to subjects in specific classes)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS class_subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER,
      subject_id INTEGER,
      teacher_id INTEGER,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
      UNIQUE(class_id, subject_id)
    );
  `);

  // 8. Attendance Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      class_id INTEGER,
      subject_id INTEGER, -- Nullable if daily general attendance
      teacher_id INTEGER,
      date TEXT NOT NULL,
      status TEXT CHECK(status IN ('Present', 'Absent', 'Late')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    );
  `);

  // 9. Exam Results Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject_id INTEGER,
      teacher_id INTEGER,
      exam_term TEXT CHECK(exam_term IN ('Term 1', 'Term 2', 'Term 3', 'Assignment', 'Final Exam')) NOT NULL,
      marks REAL NOT NULL,
      grade TEXT NOT NULL,
      class_rank INTEGER,
      subject_rank INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
      UNIQUE(student_id, subject_id, exam_term)
    );
  `);

  // 10. Notices Board Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT CHECK(category IN ('Circular', 'Holiday', 'Sports', 'Exam', 'Meeting', 'Emergency')) NOT NULL,
      target_audience TEXT CHECK(target_audience IN ('All', 'Teachers', 'Parents', 'Students')) NOT NULL,
      author_id INTEGER,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 11. Messages Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      student_id INTEGER,
      message_type TEXT CHECK(message_type IN ('absence', 'meeting', 'emergency', 'general')) NOT NULL,
      channel TEXT CHECK(channel IN ('SMS', 'Email', 'In-App')) NOT NULL,
      content TEXT NOT NULL,
      status TEXT CHECK(status IN ('sent', 'delivered', 'failed')) DEFAULT 'sent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    );
  `);

  // Seed Data if DB is empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('SmartSchool LK: Database is empty. Seeding initial demo data...');

    // Hashing passwords
    const adminHash = await bcrypt.hash('Admin123', 10);
    const teacherHash = await bcrypt.hash('Teacher123', 10);
    const parentHash = await bcrypt.hash('Parent123', 10);
    const studentHash = await bcrypt.hash('Student123', 10);

    // Insert Default Accounts
    const adminUser = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['admin@smartschool.lk', adminHash, 'admin']);
    const teacherUser1 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['teacher@smartschool.lk', teacherHash, 'teacher']);
    const teacherUser2 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['siripala@smartschool.lk', teacherHash, 'teacher']);
    const parentUser1 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['parent@smartschool.lk', parentHash, 'parent']);
    const parentUser2 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['nimal_parent@smartschool.lk', parentHash, 'parent']);
    const studentUser1 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['student@smartschool.lk', studentHash, 'student']);
    const studentUser2 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['nimal@smartschool.lk', studentHash, 'student']);
    const studentUser3 = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', ['ruwani@smartschool.lk', studentHash, 'student']);

    // Seed Classes
    await db.run("INSERT INTO classes (name) VALUES ('Grade 6A')");
    await db.run("INSERT INTO classes (name) VALUES ('Grade 7B')");
    await db.run("INSERT INTO classes (name) VALUES ('Grade 8A')");
    await db.run("INSERT INTO classes (name) VALUES ('Grade 9C')");
    await db.run("INSERT INTO classes (name) VALUES ('Grade 10A')");
    await db.run("INSERT INTO classes (name) VALUES ('Grade 11B')");

    const classes = await db.all('SELECT * FROM classes');
    const class6A = classes.find(c => c.name === 'Grade 6A').id;
    const class10A = classes.find(c => c.name === 'Grade 10A').id;
    const class11B = classes.find(c => c.name === 'Grade 11B').id;

    // Seed Subjects
    const subNames = ['Mathematics', 'Science', 'English', 'Sinhala', 'Tamil', 'History', 'ICT', 'Buddhism', 'Commerce'];
    for (const name of subNames) {
      await db.run('INSERT INTO subjects (name) VALUES (?)', [name]);
    }
    const subjects = await db.all('SELECT * FROM subjects');
    const subMath = subjects.find(s => s.name === 'Mathematics').id;
    const subSci = subjects.find(s => s.name === 'Science').id;
    const subEng = subjects.find(s => s.name === 'English').id;
    const subSin = subjects.find(s => s.name === 'Sinhala').id;
    const subHistory = subjects.find(s => s.name === 'History').id;
    const subICT = subjects.find(s => s.name === 'ICT').id;

    // Seed Teachers
    await db.run('INSERT INTO teachers (user_id, name, phone, email) VALUES (?, ?, ?, ?)', [
      teacherUser1.lastID,
      'Mr. Sunil Perera',
      '0771234567',
      'teacher@smartschool.lk'
    ]);
    const teacherId1 = 1; // Sunil Perera

    await db.run('INSERT INTO teachers (user_id, name, phone, email) VALUES (?, ?, ?, ?)', [
      teacherUser2.lastID,
      'Mr. Siripala Dias',
      '0719876543',
      'siripala@smartschool.lk'
    ]);
    const teacherId2 = 2; // Siripala Dias

    // Seed Parents
    await db.run('INSERT INTO parents (user_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)', [
      parentUser1.lastID,
      'Mrs. Priyanthi Silva',
      '0765432109',
      'parent@smartschool.lk',
      'No. 45, Flower Road, Colombo 03'
    ]);
    const parentId1 = 1; // Priyanthi Silva

    await db.run('INSERT INTO parents (user_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)', [
      parentUser2.lastID,
      'Mr. Jayalath Perera',
      '0722334455',
      'nimal_parent@smartschool.lk',
      'No. 88, Galle Road, Moratuwa'
    ]);
    const parentId2 = 2; // Jayalath Perera

    // Seed Students
    await db.run('INSERT INTO students (user_id, admission_no, name, dob, class_id, parent_id, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      studentUser1.lastID,
      'ADM-2024-001',
      'Kamal Silva',
      '2010-05-15',
      class10A,
      parentId1,
      'No specific medical conditions. Wears prescription glasses.'
    ]);
    const studentId1 = 1; // Kamal Silva

    await db.run('INSERT INTO students (user_id, admission_no, name, dob, class_id, parent_id, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      studentUser2.lastID,
      'ADM-2024-002',
      'Nimal Perera',
      '2010-08-20',
      class10A,
      parentId2,
      'Mild asthma. Uses inhaler when needed.'
    ]);
    const studentId2 = 2; // Nimal Perera

    await db.run('INSERT INTO students (user_id, admission_no, name, dob, class_id, parent_id, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      studentUser3.lastID,
      'ADM-2023-087',
      'Ruwani Gunawardena',
      '2009-11-02',
      class11B,
      parentId1, // Let's link Ruwani to parent 1 as well for child listing test
      'Allergic to penicillin.'
    ]);
    const studentId3 = 3; // Ruwani Gunawardena

    // Map Class-Subjects
    // Sunil teaches Math & English to 10A, ICT to 11B
    await db.run('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)', [class10A, subMath, teacherId1]);
    await db.run('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)', [class10A, subEng, teacherId1]);
    await db.run('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)', [class11B, subICT, teacherId1]);

    // Siripala teaches Science & Sinhala to 10A, History to 11B
    await db.run('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)', [class10A, subSci, teacherId2]);
    await db.run('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)', [class10A, subSin, teacherId2]);
    await db.run('INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?)', [class11B, subHistory, teacherId2]);

    // Seed Attendance (History of past few days)
    const dates = ['2026-05-25', '2026-05-26', '2026-05-27'];
    for (const d of dates) {
      // Kamal present, late, present
      await db.run('INSERT INTO attendance (student_id, class_id, subject_id, teacher_id, date, status) VALUES (?, ?, ?, ?, ?, ?)', [
        studentId1, class10A, subMath, teacherId1, d, d === '2026-05-26' ? 'Late' : 'Present'
      ]);
      // Nimal present, present, absent
      await db.run('INSERT INTO attendance (student_id, class_id, subject_id, teacher_id, date, status) VALUES (?, ?, ?, ?, ?, ?)', [
        studentId2, class10A, subMath, teacherId1, d, d === '2026-05-27' ? 'Absent' : 'Present'
      ]);
      // Ruwani present on all
      await db.run('INSERT INTO attendance (student_id, class_id, subject_id, teacher_id, date, status) VALUES (?, ?, ?, ?, ?, ?)', [
        studentId3, class11B, subICT, teacherId1, d, 'Present'
      ]);
    }

    // Seed Results (Term 1 & Term 2 scores)
    // Kamal Term 1 scores
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId1, subMath, teacherId1, 'Term 1', 82.0, 'A', 1, 1
    ]);
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId1, subSci, teacherId2, 'Term 1', 78.0, 'A', 2, 2
    ]);
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId1, subEng, teacherId1, 'Term 1', 88.0, 'A', 1, 1
    ]);

    // Nimal Term 1 scores
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId2, subMath, teacherId1, 'Term 1', 67.0, 'B', 2, 2
    ]);
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId2, subSci, teacherId2, 'Term 1', 81.0, 'A', 1, 1
    ]);
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId2, subEng, teacherId1, 'Term 1', 59.0, 'C', 2, 2
    ]);

    // Ruwani Term 1 scores (11B)
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId3, subICT, teacherId1, 'Term 1', 91.0, 'A', 1, 1
    ]);
    await db.run('INSERT INTO results (student_id, subject_id, teacher_id, exam_term, marks, grade, class_rank, subject_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      studentId3, subHistory, teacherId2, 'Term 1', 74.0, 'B', 1, 1
    ]);

    // Seed Notices
    await db.run("INSERT INTO notices (title, description, category, target_audience, author_id, date) VALUES (?, ?, ?, ?, ?, ?)", [
      "Annual Inter-House Sports Meet 2026",
      "The annual inter-house sports meet of SmartSchool LK will be held on June 15th, 2026 at the school main grounds. All students are requested to report in their respective house colors. Parents are welcome to attend and support our athletes.",
      "Sports",
      "All",
      adminUser.lastID,
      "2026-05-28"
    ]);

    await db.run("INSERT INTO notices (title, description, category, target_audience, author_id, date) VALUES (?, ?, ?, ?, ?, ?)", [
      "Grade 11 Seminar on G.C.E. O/L Mathematics",
      "A special model paper seminar for Grade 11 students will be conducted by Mr. Sunil Perera on Saturday, June 6th from 8:00 AM to 1:30 PM. Attendance is compulsory for all O/L candidates.",
      "Exam",
      "Parents",
      adminUser.lastID,
      "2026-05-27"
    ]);

    await db.run("INSERT INTO notices (title, description, category, target_audience, author_id, date) VALUES (?, ?, ?, ?, ?, ?)", [
      "Staff Meeting - Term Test Evaluation",
      "A mandatory meeting for all academic staff members will be held in the main conference room on Friday at 2:00 PM to evaluate the Term 1 exam results and discuss lesson plans.",
      "Meeting",
      "Teachers",
      adminUser.lastID,
      "2026-05-26"
    ]);

    // Seed Messages/Alert History
    await db.run("INSERT INTO messages (sender_id, receiver_id, student_id, message_type, channel, content, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      teacherUser1.lastID,
      parentUser2.lastID,
      studentId2,
      "absence",
      "SMS",
      "Dear Parent, your child Nimal Perera was marked absent today at SmartSchool LK. Please contact the class teacher if needed.",
      "delivered"
    ]);

    console.log('SmartSchool LK: Database seeding completed successfully.');
  } else {
    console.log('SmartSchool LK: Database already contains data. Seeding skipped.');
  }
}

// Grade calculation utility based on Sri Lankan grading system
function calculateGrade(marks) {
  if (marks >= 75) return 'A';
  if (marks >= 65) return 'B';
  if (marks >= 55) return 'C';
  if (marks >= 35) return 'S';
  return 'F';
}

module.exports = {
  getDB,
  initializeDatabase,
  calculateGrade
};
