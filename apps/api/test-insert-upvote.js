const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { CommunityUpvote } = require('./dist/modules/community/entities/community-upvote.entity');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const upvoteRepo = app.get(getRepositoryToken(CommunityUpvote));
  
  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  try {
    const res = await upvoteRepo.insert({
      user: { id: userId },
      thread: { id: threadId },
    });
    console.log("Insert result:", res);
  } catch(e) {
    console.log("Insert error:", e.message);
  }

  await app.close();
}
run();
