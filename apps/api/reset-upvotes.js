const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' }); // Load env to get DB URL just in case, but hardcoded fallback below

async function run() {
  const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tutaly';
  const client = new Client({ connectionString: url });
  
  await client.connect();
  console.log('Resetting ghost upvotes...');
  const res = await client.query(`
    UPDATE community_threads 
    SET upvotes_count = (
      SELECT COUNT(*) FROM community_upvotes WHERE thread_id = community_threads.id
    )
  `);
  console.log(`Updated ${res.rowCount} threads. Ghost upvotes cleared.`);
  await client.end();
}
run().catch(console.error);
