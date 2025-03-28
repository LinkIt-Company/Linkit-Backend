import { Controller, Get, Query } from '@nestjs/common';
import { LaunchingEventsService } from './launching-events.service';

@Controller('launching-events')
export class LaunchingEventsController {
  constructor(
    private readonly launchingEventsService: LaunchingEventsService,
  ) {}

  @Get()
  public async getResult(
    @Query('name') name: string,
    @Query('keywords') keywords: string,
    @Query('link') link: string,
  ) {
    const result = await this.launchingEventsService.getResult(keywords, link);

    const maxScore = Math.min(Math.max(...result), 100);
    return { name, score: maxScore };
  }
}
