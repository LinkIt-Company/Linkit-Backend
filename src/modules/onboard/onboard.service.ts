import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { OnboardCategory } from '@src/infrastructure/database/entities/onboard-category.entity';
import { OnBoardQuery } from './dto';
import { OnBoardRepository } from './onboard.pg.repository';

@Injectable()
export class OnboardService {
  constructor(private readonly onBoardRepository: OnBoardRepository) {}

  async listOnBoardKeywords(query: OnBoardQuery) {
    const categoryList = await this.onBoardRepository.getOnboardCategoryList();
    return query.limit
      ? this.getLimitedOnBoardKeywords(categoryList, query.limit)
      : categoryList;
  }

  private getLimitedOnBoardKeywords(
    keywords: OnboardCategory[],
    limit: number,
  ) {
    return _.sampleSize(keywords, limit);
  }
}
