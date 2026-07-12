import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stats/platform')
  async getPlatformStats() {
    return {
      success: true,
      data: await this.appService.getPlatformStats(),
    };
  }
}
