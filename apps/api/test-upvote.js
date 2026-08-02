const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { CommunityService } = require('./dist/modules/community/community.service');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityService = app.get(CommunityService);

  const threadId = '10301bea-b215-422c-8ec7-e5985142da5e';
  const userId = '93f9d739-6db8-4b2b-b4bc-157d52de192f';

  try {
    console.log("Upvoting 1st time...");
    let res = await communityService.upvoteThread(threadId, userId);
    console.log(res);

    console.log("Upvoting 2nd time...");
    res = await communityService.upvoteThread(threadId, userId);
    console.log(res);
    
    console.log("Upvoting 3rd time...");
    res = await communityService.upvoteThread(threadId, userId);
    console.log(res);
  } catch (err) {
    console.error("Error:", err);
  }

  await app.close();
}
run();
