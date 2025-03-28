import { Module } from '@nestjs/common';
import { PuppeteerPoolService } from './puppeteer-pool.service';

@Module({
  providers: [PuppeteerPoolService],
  exports: [PuppeteerPoolService],
})
export class PuppeteerPoolModule {}
