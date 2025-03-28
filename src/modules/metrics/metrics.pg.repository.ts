import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Metrics } from '@src/infrastructure/database/entities/metrics.entity';

@Injectable()
export class MetricsRepository extends Repository<Metrics> {
  constructor(private dataSource: DataSource) {
    super(Metrics, dataSource.createEntityManager());
  }

  async createMetrics(
    isSuccess: boolean,
    time: number,
    postURL: string,
    postId: string,
  ) {
    const metrics = await this.save({
      isSuccess,
      time,
      postURL,
      postId,
    });
    return metrics;
  }
}
