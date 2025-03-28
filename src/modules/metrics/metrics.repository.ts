import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metrics } from '@src/infrastructure';

@Injectable()
export class MetricsRepository {
  constructor(
    @InjectModel(Metrics.name) private readonly metricsModel: Model<Metrics>,
  ) {}

  async createMetrics(
    isSuccess: boolean,
    time: number,
    postURL: string,
    postId: string,
  ) {
    const metrics = await this.metricsModel.create({
      isSuccess,
      time,
      postURL,
      postId,
    });
    return metrics;
  }
}
