require('dotenv').config({ path: '../../.env' });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query('SELECT id, email FROM users LIMIT 2');
  
  const user1 = res.rows[0];
  const user2 = res.rows[1];

  console.log(`User 1: ${user1.email}`);
  console.log(`User 2: ${user2.email}`);

  const hash = await bcrypt.hash('password123', 12);
  
  await client.query('UPDATE users SET password = $1 WHERE id IN ($2, $3)', [hash, user1.id, user2.id]);
  console.log('Passwords updated to password123');

  await client.end();
}
run();
