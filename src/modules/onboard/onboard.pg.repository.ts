import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OnboardCategory } from '@src/infrastructure/database/entities/onboard-category.entity';
import { onBoardCategoryList } from './onboard.const';

@Injectable()
export class OnBoardRepository extends Repository<OnboardCategory> {
  constructor(private dataSource: DataSource) {
    super(OnboardCategory, dataSource.createEntityManager());
  }

  async addOnboard(onboard: OnboardCategory) {
    /// 카테고리 요소에 중복된 값이 없는 경우
    if (
      (await this.find({ where: { category: onboard.category } })).length === 0
    ) {
      await this.save(onboard);
    }
  }

  private async addOnboardList(): Promise<OnboardCategory[]> {
    const newList = onBoardCategoryList.map((category) => ({ category }));

    await this.createQueryBuilder()
      .insert()
      .into('onboards')
      .values(newList)
      .execute();

    return this.find();
  }

  async getOnboardCategoryList(): Promise<OnboardCategory[]> {
    const categories = await this.find();

    if (categories.length === 0) {
      return this.addOnboardList();
    }
    return categories;
  }
}
