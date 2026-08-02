const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.upwykoazsikszvcblwgh:swJRB%21%3Fqn43h57u@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  
  const res = await client.query(`
    SELECT id, upvotes_count FROM community_threads LIMIT 1;
  `);
  
  console.log("Threads:", res.rows);
  
  const res2 = await client.query(`
    SELECT id FROM users LIMIT 1;
  `);
  console.log("Users:", res2.rows);

  await client.end();
}
run().catch(console.error);
