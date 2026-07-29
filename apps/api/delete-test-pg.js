const { Client } = require('pg');

async function deleteTestAccounts() {
  require('dotenv').config({ path: '../../.env' });
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    console.log('Attempting to delete test accounts...');
    
    const res = await client.query(`DELETE FROM users WHERE "isTestAccount" = true OR email LIKE '%testlock%' OR email LIKE '%testseeker%' OR email LIKE '%testemployer%' OR email LIKE '%@example.com%'`);
    console.log(`Deleted ${res.rowCount} test accounts successfully.`);

  } catch (err) {
    console.error('Delete failed, possibly due to FK constraints:', err.message);
    
    if (err.message.includes('violates foreign key constraint')) {
      console.log('Attempting manual cascade delete...');
      try {
        const query = `
          DO $$
          DECLARE
              test_user_id uuid;
          BEGIN
              FOR test_user_id IN (SELECT id FROM users WHERE "isTestAccount" = true OR email LIKE '%testlock%' OR email LIKE '%testseeker%' OR email LIKE '%testemployer%' OR email LIKE '%@example.com%') LOOP
                  DELETE FROM notifications WHERE "userId" = test_user_id;
                  DELETE FROM follows WHERE "followerId" = test_user_id OR "followingId" = test_user_id;
                  DELETE FROM post_likes WHERE "userId" = test_user_id;
                  DELETE FROM post_comments WHERE "authorId" = test_user_id;
                  DELETE FROM posts WHERE "authorId" = test_user_id;
                  DELETE FROM job_applications WHERE "seekerId" = test_user_id;
                  DELETE FROM jobs WHERE "employerId" = test_user_id;
                  DELETE FROM seeker_profiles WHERE "userId" = test_user_id;
                  DELETE FROM employer_profiles WHERE "userId" = test_user_id;
                  -- Delete the user itself
                  DELETE FROM users WHERE id = test_user_id;
              END LOOP;
          END $$;
        `;
        await client.query(query);
        console.log('Manual cascade delete completed.');
      } catch (cascadeErr) {
        console.error('Cascade delete also failed:', cascadeErr);
      }
    }
  } finally {
    await client.end();
  }
}

deleteTestAccounts();
