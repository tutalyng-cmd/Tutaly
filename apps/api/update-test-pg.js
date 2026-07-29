const { Client } = require('pg');

async function update() {
  require('dotenv').config({ path: '../../.env' });
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`UPDATE users SET "isTestAccount" = true WHERE email LIKE '%testlock%'`);
    console.log(`Updated ${res.rowCount} test accounts`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

update();
