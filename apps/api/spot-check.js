const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.upwykoazsikszvcblwgh:swJRB%21%3Fqn43h57u@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
  await client.connect();

  const res = await client.query(`
    SELECT t.id, t.title, t.upvotes_count as cached_count,
           (SELECT COUNT(*) FROM community_upvotes u WHERE u.thread_id = t.id) as actual_count
    FROM community_threads t
    LIMIT 3;
  `);

  console.log("Spot check results:");
  console.table(res.rows);

  await client.end();
}
run();
