const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.upwykoazsikszvcblwgh:swJRB%21%3Fqn43h57u@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  
  const res = await client.query(`
    SELECT conname, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'community_upvotes'::regclass;
  `);
  
  console.log("Constraints on community_upvotes:");
  res.rows.forEach(r => console.log(`- ${r.conname}: ${r.pg_get_constraintdef}`));
  
  await client.end();
}
run().catch(console.error);
