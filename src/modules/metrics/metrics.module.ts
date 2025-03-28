import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Metrics, MetricsSchema } from '@src/infrastructure';
import { MetricsRepository } from './metrics.repository';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Metrics.name, schema: MetricsSchema }]),
  ],
  providers: [MetricsService, MetricsRepository],
  exports: [MetricsService, MetricsRepository],
})
export class MetricsModule {}
