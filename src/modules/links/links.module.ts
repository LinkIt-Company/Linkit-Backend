import { Module } from '@nestjs/common';
import { LinksController } from './links.v2.controller';
import { LinksService } from './links.v2.service';

@Module({
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
