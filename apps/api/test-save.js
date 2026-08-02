const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');
const { DataSource } = require('typeorm');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);
  const ds = app.get(DataSource);

  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  // 1. Try to create and save normally
  const upvote = communityService.upvoteRepo.create({
    user: { id: userId },
    thread: { id: threadId },
  });
  console.log("Created upvote:", upvote);
  await communityService.upvoteRepo.save(upvote);

  // 2. Fetch it from DB to see if user_id is null
  const dbRows = await ds.query('SELECT * FROM community_upvotes WHERE id = $1', [upvote.id]);
  console.log("DB Row:", dbRows[0]);

  await app.close();
}
run().catch(console.error);
