import { Module } from '@nestjs/common';
import { OnboardController } from './onboard.controller';
import { OnBoardRepository } from './onboard.pg.repository';
import { OnboardService } from './onboard.service';

@Module({
  providers: [OnboardService, OnBoardRepository],
  controllers: [OnboardController],
})
export class OnboardModule {}
