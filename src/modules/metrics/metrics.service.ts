import { Injectable } from '@nestjs/common';
import { MetricsRepository } from './metrics.repository';

@Injectable()
export class MetricsService {
  constructor(private readonly repository: MetricsRepository) {}

  async createMetrics(
    isSuccess: boolean,
    time: number,
    postURL: string,
    postId: string,
  ) {
    const metric = await this.repository.createMetrics(
      isSuccess,
      time,
      postURL,
      postId,
    );
    return metric;
  }
}
