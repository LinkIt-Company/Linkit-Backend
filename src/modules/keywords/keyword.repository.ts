import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Keyword } from '@src/infrastructure';

@Injectable()
export class KeywordsRepository {
  constructor(
    @InjectModel(Keyword.name)
    private readonly keywordModel: Model<Keyword>,
  ) {}

  async createMany(keywords: string[]) {
    return await this.keywordModel.insertMany(
      keywords.map((keyword) => ({
        name: keyword,
      })),
    );
  }
}
