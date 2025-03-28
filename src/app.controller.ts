// Nest Packagess
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
// Custom Packages
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/pool/metrics')
  @ApiOperation({
    summary: 'Puppeteer Pool Metric 모니터링 API (Client용 아닙니다)',
  })
  async poolMetrics() {
    return await this.appService.poolMetrics();
  }
}
