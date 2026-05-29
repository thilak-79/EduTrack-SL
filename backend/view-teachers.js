const { getDB } = require('./config/db');

async function viewTeachers() {
  const db = await getDB();

  const teachers = await db.all(`
    SELECT 
      t.id AS teacher_id,
      t.name,
      t.phone,
      t.email AS profile_email,
      u.id AS user_id,
      u.email AS login_email,
      u.role,
      u.created_at
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.id ASC
  `);

  console.table(teachers);
}

viewTeachers();