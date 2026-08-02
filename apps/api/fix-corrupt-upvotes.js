const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.upwykoazsikszvcblwgh:swJRB%21%3Fqn43h57u@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
  await client.connect();

  try {
    await client.query('BEGIN');

    console.log("Cleaning up corrupted community_upvotes...");
    const deleteRes = await client.query(`
      DELETE FROM community_upvotes WHERE user_id IS NULL;
    `);
    console.log(`Deleted ${deleteRes.rowCount} corrupted upvote rows.`);

    console.log("Recalculating thread upvotes_count...");
    const updateRes = await client.query(`
      UPDATE community_threads t
      SET upvotes_count = (
        SELECT COUNT(*) FROM community_upvotes u WHERE u.thread_id = t.id
      )
      WHERE upvotes_count != (
        SELECT COUNT(*) FROM community_upvotes u WHERE u.thread_id = t.id
      );
    `);
    console.log(`Updated upvotes_count for ${updateRes.rowCount} threads.`);

    await client.query('COMMIT');
    console.log("Database cleanup successful!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error during cleanup:", err);
  } finally {
    await client.end();
  }
}
run();
