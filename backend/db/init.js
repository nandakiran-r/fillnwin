import pool from '../config/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
    try {
        console.log('🔄 Initializing database...');

        // 1. Execute Schema
        console.log('   Running schema...');
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('   ✅ Schema executed');

        // 2. Seed Admin User
        console.log('   Seeding admin user...');
        const checkUser = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['admin']
        );

        if (checkUser.rows.length > 0) {
            console.log('   ℹ️  Admin user already exists');
        } else {
            const password = 'fillnwin2025';
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            await pool.query(
                'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
                ['admin', passwordHash]
            );
            console.log('   ✅ Admin user created successfully!');
            console.log('      Username: admin');
            console.log('      Password: fillnwin2025');
        }

        console.log('✅ Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initDatabase();
