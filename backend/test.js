const bcrypt = require('bcryptjs');
const { getDB, initializeDatabase, calculateGrade } = require('./config/db');

async function runTests() {
  console.log('--- STARTING SMARTSCHOOL LK INTEGRATION TESTS ---');
  try {
    // 1. Initialize DB and Seed Data
    console.log('1. Bootstrapping database...');
    await initializeDatabase();
    const db = await getDB();
    console.log('✔ Database connection OK');

    // 2. Query Seeding Aggregations
    console.log('2. Auditing database schema populations...');
    const users = await db.all('SELECT email, role FROM users');
    console.log(`✔ Found ${users.length} registered login accounts in database.`);
    
    const classes = await db.all('SELECT name FROM classes');
    console.log(`✔ Classes populated: ${classes.map(c => c.name).join(', ')}`);
    
    const subjects = await db.all('SELECT name FROM subjects');
    console.log(`✔ Subjects populated: ${subjects.map(s => s.name).join(', ')}`);

    // 3. Test Authentication Hash Match
    console.log('3. Checking password crypt match for demo Admin...');
    const adminUser = await db.get("SELECT * FROM users WHERE email = 'admin@smartschool.lk'");
    if (!adminUser) throw new Error('Demo admin seed missing');
    
    const isMatch = await bcrypt.compare('Admin123', adminUser.password_hash);
    if (!isMatch) throw new Error('Bcrypt password verification failed');
    console.log('✔ Bcryptjs password hash matching OK');

    // 4. Test Local Grading calculations
    console.log('4. Testing grading translation utility...');
    const gradeA = calculateGrade(87.5);
    const gradeF = calculateGrade(24.0);
    if (gradeA !== 'A' || gradeF !== 'F') throw new Error('Grade calculator mismatch');
    console.log(`✔ Grade translator logic OK (87.5 -> ${gradeA}, 24.0 -> ${gradeF})`);

    // 5. Check Rank Calculations
    console.log('5. Auditing auto-ranking records...');
    const mathResults = await db.all(`
      SELECT s.name, r.marks, r.class_rank 
      FROM results r
      JOIN students s ON r.student_id = s.id
      WHERE r.subject_id = 1 AND r.exam_term = 'Term 1'
      ORDER BY r.marks DESC
    `);
    
    console.log('✔ Term 1 Mathematics roster ranks:');
    mathResults.forEach(r => {
      console.log(`   - ${r.name}: Score ${r.marks}% | Rank #${r.class_rank}`);
    });

    console.log('===================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('===================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ INTEGRATION TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();
