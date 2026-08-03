const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');
const { DataSource } = require('typeorm');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);
  const ds = app.get(DataSource);
  
  // Turn on logging for this test
  ds.setOptions({ logging: true });
  ds.buildMetadatas(); // force options to apply? Not easily in TypeORM after init...
  // We can just execute raw SQL to turn on logging or we can just observe manually
  
  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  try {
    const upvote = communityService.upvoteRepo.create({
      user: { id: userId },
      thread: { id: threadId },
    });
    console.log("Upvote object:", upvote);
    const saved = await communityService.upvoteRepo.save(upvote);
    console.log("Saved upvote:", saved);
  } catch(e) {
    console.log("Save error:", e.message);
  }

  await app.close();
}
run();
