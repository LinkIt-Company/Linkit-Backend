import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostKeyword } from '@src/infrastructure/database/schema/postKeyword.schema';

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

  async findKeywordsByPostId(
    postId: string,
  ): Promise<
    (PostKeyword & { keywordId: { _id: Types.ObjectId; name: string } })[]
  > {
    return await this.postKeywordModel
      .find({
        postId: postId,
      })
      .populate({
        path: 'keywordId',
        model: 'Keyword',
      })
      .lean();
  }

  async findKeywordsByPostIds(postIds: string[]) {
    return await this.postKeywordModel
      .find({ postId: { $in: postIds } })
      .populate({ path: 'keywordId', model: 'Keyword' })
      .lean();
  }
}
