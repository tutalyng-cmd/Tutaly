const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');
const { DataSource } = require('typeorm');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { CommunityUpvote } = require('./dist/modules/community/entities/community-upvote.entity');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);
  const ds = app.get(DataSource);
  
  const upvoteRepo = app.get(getRepositoryToken(CommunityUpvote));
  
  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  // Clear existing
  await ds.query('DELETE FROM community_upvotes WHERE thread_id = $1 AND user_id = $2', [threadId, userId]);

  try {
    const upvote = upvoteRepo.create({
      user: { id: userId },
      thread: { id: threadId },
    });
    console.log("Upvote object:", upvote);
    const saved = await upvoteRepo.save(upvote);
    console.log("Saved upvote:", saved);
  } catch(e) {
    console.log("Save error:", e.message);
  }

  await app.close();
}
run();
