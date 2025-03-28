import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PuppeteerPoolService } from './infrastructure/puppeteer-pool/puppeteer-pool.service';

@Injectable()
export class AppService {
  constructor(
    private readonly config: ConfigService,
    private readonly puppeteer: PuppeteerPoolService,
  ) {}

  getHello(): string {
    return 'Hello Dorabangs!';
  }

  async poolMetrics() {
    return await this.puppeteer.getPoolMetrics();
  }
}
