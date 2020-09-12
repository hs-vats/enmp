import 'dotenv/config.js';
import { Client } from 'pg';

import { users } from '../users';

const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
pg.connect();

(async () => {
    try {
        await pg.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await pg.query(`CREATE TABLE users (
            id UUID DEFAULT uuid_generate_v4 (),
            login VARCHAR NOT NULL,
            password VARCHAR NOT NULL,
            age NUMERIC(3) NOT NULL,
            "isDeleted" BOOLEAN NOT NULL DEFAULT false,
            PRIMARY KEY (id)
        )`);
        console.log('users table is created');

        for (const user of users) {
            const result = await pg.query(
                'INSERT INTO users (login, password, age, "isDeleted") VALUES ($1, $2, $3, $4) RETURNING *',
                user
            );
            const { id, login, password, age, isDeleted } = result.rows[0];
            console.log('inserted', id, login, password, age, isDeleted);
        }

        await pg.query('CREATE TYPE permissions AS ENUM (\'READ\', \'WRITE\', \'DELETE\', \'SHARE\', \'UPLOAD_FILES\');');
        await pg.query(`CREATE TABLE groups (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
            name VARCHAR NOT NULL,
            permissions permissions[] not NULL
        )`);
        console.log('groups table is created');

        await pg.query(`INSERT INTO groups (name, permissions) VALUES
            ('reader', '{ READ, SHARE }'),
            ('writer', '{ WRITE, DELETE, UPLOAD_FILES }');
        `);
    } catch (e) {
        console.log('something went wrong', e);
    }
    pg.end();
})();
