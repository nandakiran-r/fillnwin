import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function seedUsers() {
    try {
        console.log('🔄 Seeding admin user...');

        // Check if admin user already exists
        const checkUser = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['admin']
        );

        if (checkUser.rows.length > 0) {
            console.log('ℹ️  Admin user already exists');
            process.exit(0);
        }

        // Hash the password
        const password = 'fillnwin2025';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert admin user
        await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            ['admin', passwordHash]
        );

        console.log('✅ Admin user created successfully!');
        console.log('   Username: admin');
        console.log('   Password: fillnwin2025');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();
