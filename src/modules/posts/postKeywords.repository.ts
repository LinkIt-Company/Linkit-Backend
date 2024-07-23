import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostKeyword } from '@src/infrastructure/database/schema/postKeyword.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostKeywordsRepository {
  constructor(
    @InjectModel(PostKeyword.name)
    private readonly postKeywordModel: Model<PostKeyword>,
  ) {}

  async createPostKeywords(postId: string, keywordIds: string[]) {
    const postKeywords = keywordIds.map((keywordId) => ({
      postId,
      keywordId,
    }));

    await this.postKeywordModel.insertMany(postKeywords);
  }

  async findKeywordsByPostIds(postIds: string[]) {
    return await this.postKeywordModel
      .find({ postId: { $in: postIds } })
      .populate({ path: 'keywordId', model: 'Keyword' })
      .lean();
  }
}
