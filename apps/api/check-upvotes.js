const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.upwykoazsikszvcblwgh:swJRB%21%3Fqn43h57u@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  
  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  const res = await client.query(`
    SELECT * FROM community_upvotes WHERE thread_id = $1 AND user_id = $2;
  `, [threadId, userId]);
  
  console.log("Upvotes:", res.rows);
  await client.end();
}
run().catch(console.error);
