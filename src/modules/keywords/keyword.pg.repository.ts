import { Injectable } from '@nestjs/common';
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class KeywordsPGRepository extends Repository<Keyword> {
  constructor(private dataSource: DataSource) {
    super(Keyword, dataSource.createEntityManager());
  }

  async createMany(keywords: string[]) {
    const entities = keywords.map((keyword) => {
      const entity = new Keyword();
      entity.name = keyword;
      return entity;
    });

    return await this.save(entities);
  }
}
