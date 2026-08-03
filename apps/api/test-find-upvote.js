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

  const existingUpvote = await communityService.upvoteRepo.findOne({
    where: {
      user: { id: userId },
      thread: { id: threadId },
    },
  });
  console.log("existingUpvote:", existingUpvote);

  await app.close();
}
run();
