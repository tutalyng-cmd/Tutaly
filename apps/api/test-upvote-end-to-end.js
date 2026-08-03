const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');
const { DataSource } = require('typeorm');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);
  const ds = app.get(DataSource);

  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f'; // user with some threads

  // Clear upvotes for this user/thread first so we start clean
  await ds.query('DELETE FROM community_upvotes WHERE thread_id = $1 AND user_id = $2', [threadId, userId]);

  console.log("=== FIRST ATTEMPT (Should insert) ===");
  try {
    const res1 = await communityService.upvoteThread(threadId, userId);
    console.log("Result 1:", res1);
  } catch(e) {
    console.log("Error 1:", e.message);
  }

  // Check what's in DB
  const dbRows1 = await ds.query('SELECT * FROM community_upvotes WHERE thread_id = $1 AND user_id = $2', [threadId, userId]);
  console.log("DB rows after attempt 1:", dbRows1);

  console.log("\\n=== SECOND ATTEMPT (Should toggle off) ===");
  try {
    const res2 = await communityService.upvoteThread(threadId, userId);
    console.log("Result 2:", res2);
  } catch(e) {
    console.log("Error 2:", e.message);
  }
  
  // Check what's in DB
  const dbRows2 = await ds.query('SELECT * FROM community_upvotes WHERE thread_id = $1 AND user_id = $2', [threadId, userId]);
  console.log("DB rows after attempt 2:", dbRows2);

  await app.close();
}
run();
