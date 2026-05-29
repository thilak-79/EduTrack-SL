const bcrypt = require('bcryptjs');
const { getDB } = require('./config/db');

async function updateAdmin() {
  try {
    const db = await getDB();

    const newEmail = 'admin@jhc.lk';
    const newPassword = 'JHCAdmin';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await db.get(
      "SELECT * FROM users WHERE role = 'admin'"
    );

    if (!admin) {
      console.log('No admin account found.');
      return;
    }

    await db.run(
      'UPDATE users SET email = ?, password_hash = ? WHERE id = ?',
      [newEmail.toLowerCase(), hashedPassword, admin.id]
    );

    console.log('Admin login updated successfully!');
    console.log('New admin email:', newEmail);
    console.log('New admin password:', newPassword);

  } catch (error) {
    console.error('Error updating admin:', error);
  }
}

updateAdmin();