const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);

  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  const upvote = communityService.upvoteRepo.create({
    user: { id: userId },
    thread: { id: threadId },
  });
  console.log("Created upvote entity:", upvote);
  
  try {
    const saved = await communityService.upvoteRepo.save(upvote);
    console.log("Saved upvote result:", saved);
  } catch (err) {
    console.error("Save error:", err);
  }

  await app.close();
}
run();
