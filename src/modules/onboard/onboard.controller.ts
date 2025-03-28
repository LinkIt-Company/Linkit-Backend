import { Controller, Get, Query } from '@nestjs/common';
import { ListOnBoardKeywordsDocs, OnBoardControllerDocs } from './docs';
import { OnBoardQuery } from './dto';
import { OnboardService } from './onboard.service';

@Controller('onboard')
@OnBoardControllerDocs
export class OnboardController {
  constructor(private readonly onboardService: OnboardService) {}

  @Get()
  @ListOnBoardKeywordsDocs
  listOnBoardKeywords(@Query() query: OnBoardQuery) {
    return this.onboardService.listOnBoardKeywords(query);
  }
}
