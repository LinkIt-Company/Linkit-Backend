import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';

@Injectable()
export class KeywordsPGRepository extends Repository<Keyword> {
  constructor(private dataSource: DataSource) {
    super(Keyword, dataSource.createEntityManager());
  }

  async createMany(keywords: string[]) {
    const entities = keywords.map((keyword) => {
      const entity = this.create({
        name: keyword,
      });
      return entity;
    });

    return await this.save(entities);
  }
}
