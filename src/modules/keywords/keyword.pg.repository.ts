import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';

@Injectable()
export class KeywordsRepository extends Repository<Keyword> {
  constructor(private dataSource: DataSource) {
    super(Keyword, dataSource.createEntityManager());
  }

  async createMany(keywords: string[]) {
    return await this.save(
      keywords.map((keyword) => ({
        name: keyword,
      })),
    );
  }
}
