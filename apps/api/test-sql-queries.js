const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');
const { DataSource } = require('typeorm');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);
  const ds = app.get(DataSource);
  
  // Enable query logging globally for the data source
  ds.logger.options = 'all';

  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  await ds.query('DELETE FROM community_upvotes WHERE thread_id = $1 AND user_id = $2', [threadId, userId]);

  console.log("=== EXECUTING UPVOTE 1 ===");
  await communityService.upvoteThread(threadId, userId);

  console.log("=== EXECUTING UPVOTE 2 ===");
  await communityService.upvoteThread(threadId, userId);

  await app.close();
}
run();
