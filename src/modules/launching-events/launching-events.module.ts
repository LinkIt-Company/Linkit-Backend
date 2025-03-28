import { Module } from '@nestjs/common';
import { AiModule } from '@src/infrastructure/ai/ai.module';
import { LaunchingEventsController } from './launching-events.controller';
import { LaunchingEventsService } from './launching-events.service';

@Module({
  imports: [AiModule],
  controllers: [LaunchingEventsController],
  providers: [LaunchingEventsService],
})
export class LaunchingEventsModule {}
