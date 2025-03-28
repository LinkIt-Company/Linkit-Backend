import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { OrderType } from '@src/common';
import { AIClassification, Post, PostDocument } from '@src/infrastructure';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { ClassificationPostList } from '../classification/dto/classification.dto';
import { P001 } from './error';
import { PostUpdateableFields } from './type/type';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(AIClassification.name)
    private readonly aiClassificationModel: Model<AIClassification>,
  ) {}

  async getUserPostCount(
    userId: string,
    isFavorite?: boolean,
    isRead?: boolean,
  ) {
    const queryFilter: FilterQuery<Post> = {
      userId: userId,
    };
    if (isFavorite) {
      queryFilter['isFavorite'] = true;
    }

    if (isRead) {
      queryFilter['readAt'] = { $ne: null };
    } else if (isRead === false) {
      queryFilter['readAt'] = null;
    }

    const userPostCount = await this.postModel.countDocuments(queryFilter);
    return userPostCount;
  }

  async listPost(
    userId: string,
    page: number,
    limit: number,
    isFavorite?: boolean,
    order = OrderType.desc,
    isRead?: boolean,
  ) {
    // Skip Query
    const skipQuery = (page - 1) * limit;
    const queryFilter: FilterQuery<Post> = {
      userId: userId,
    };
    // If isFavorite is not undefined and is typeof boolean
    if (isFavorite) {
      queryFilter['isFavorite'] = true;
    }

    if (isRead) {
      queryFilter['readAt'] = { $ne: null };
    } else if (isRead === false) {
      queryFilter['readAt'] = null;
    }
    const posts = await this.postModel
      .find(queryFilter)
      .sort([['createdAt', order === OrderType.desc ? -1 : 1]])
      .skip(skipQuery)
      .limit(limit)
      .lean();
    return posts;
  }

  async findPostOrThrow(param: FilterQuery<PostDocument>) {
    const post = await this.postModel.findOne(param).lean();
    if (!post) {
      throw new NotFoundException(P001);
    }
    return post;
  }

  async updatePostFolder(userId: string, postId: string, folderId: string) {
    const updatedPost = await this.postModel
      .updateOne(
        {
          _id: postId,
          userId: userId,
        },
        {
          folderId: folderId,
        },
      )
      .lean();
    return updatedPost;
  }

  async updatePostListFolder(
    userId: string,
    postIdList: string[],
    suggestedFolderId: string,
  ) {
    const operations = postIdList.map((postId) => ({
      updateOne: {
        filter: { _id: postId, userId: userId },
        update: { $set: { folderId: suggestedFolderId } },
        upsert: false,
      },
    }));

    await this.postModel.bulkWrite(operations);
  }

  async createPost(
    userId: string,
    folderId: string,
    url: string,
    title: string,
    thumbnail: string,
    postAIStatus: PostAiStatus,
  ) {
    const postModel = await this.postModel.create({
      folderId: folderId,
      url: url,
      title: title,
      userId: userId,
      readAt: null,
      thumbnailImgUrl: thumbnail,
      aiStatus: postAIStatus,
    });
    return postModel.toObject();
  }

  async getPostCountByFolderIds(folderIds: Types.ObjectId[]) {
    const folders = await this.postModel.aggregate<{
      _id: Types.ObjectId;
      postCount: number;
    }>([
      {
        $match: {
          folderId: { $in: folderIds },
        },
      },
      {
        $group: {
          _id: '$folderId',
          postCount: { $sum: 1 },
        },
      },
    ]);

    return folders;
  }

  async findBySuggestedFolderId(
    userId: string,
    suggestedFolderId: Types.ObjectId,
    offset: number,
    limit: number,
  ): Promise<ClassificationPostList[]> {
    return await this.postModel
      .aggregate([
        {
          $match: { userId: new Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'ai_classifications',
            localField: 'aiClassificationId',
            foreignField: '_id',
            as: 'aiClassification',
          },
        },
        {
          $unwind: '$aiClassification',
        },
        {
          $match: {
            'aiClassification.deletedAt': null,
            'aiClassification.suggestedFolderId': suggestedFolderId,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 0,
            folderId: { $toString: '$aiClassification.suggestedFolderId' },
            postId: { $toString: '$_id' },
            title: 1,
            url: 1,
            description: 1,
            createdAt: 1,
            readAt: 1,
            aiStatus: 1,
            thumbnailImgUrl: 1,
            keywords: '$aiClassification.keywords',
          },
        },
      ])
      .exec();
  }

  async getCountByFolderId(folderId: string, isRead?: boolean) {
    const queryFilter: FilterQuery<Post> = {
      folderId: folderId,
    };

    if (isRead) {
      queryFilter['readAt'] = { $ne: null };
    } else if (isRead === false) {
      queryFilter['readAt'] = null;
    }
    const count = await this.postModel.countDocuments(queryFilter);

    return count;
  }

  async findByFolderId(
    folderId: string,
    page: number,
    limit: number,
    order: OrderType = OrderType.desc,
    isRead?: boolean,
  ) {
    const offset = (page - 1) * limit;
    const queryFilter: FilterQuery<Post> = {
      folderId: folderId,
    };

    if (isRead) {
      queryFilter['readAt'] = { $ne: null };
    } else if (isRead === false) {
      queryFilter['readAt'] = null;
    }

    const folders = await this.postModel
      .find(queryFilter)
      .skip(offset)
      .sort([['createdAt', order === OrderType.desc ? -1 : 1]])
      .limit(limit)
      .lean();

    return folders;
  }

  async findFavoritePostCount(userId: string) {
    const count = await this.postModel.countDocuments({
      userId,
      isFavorite: true,
    });

    return count;
  }

  async findAndSortBySuggestedFolderIds(
    userId: Types.ObjectId,
    suggestedFolderIds: Types.ObjectId[],
    offset: number,
    limit: number,
  ): Promise<ClassificationPostList[]> {
    return await this.postModel
      .aggregate([
        {
          $match: { userId: new Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'ai_classifications',
            localField: 'aiClassificationId',
            foreignField: '_id',
            as: 'aiClassification',
          },
        },
        {
          $unwind: '$aiClassification',
        },
        {
          $match: {
            'aiClassification.deletedAt': null,
            'aiClassification.suggestedFolderId': {
              $in: suggestedFolderIds,
            },
          },
        },
        {
          $addFields: {
            order: {
              $indexOfArray: [
                suggestedFolderIds,
                '$aiClassification.suggestedFolderId',
              ],
            },
          },
        },
        {
          $sort: {
            order: 1,
            createdAt: -1,
          },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 0,
            folderId: { $toString: '$aiClassification.suggestedFolderId' },
            postId: { $toString: '$_id' },
            title: 1,
            url: 1,
            description: 1,
            createdAt: 1,
            readAt: 1,
            aiStatus: 1,
            thumbnailImgUrl: 1,
            keywords: '$aiClassification.keywords',
          },
        },
      ])
      .exec();
  }

  async findFolderIdsBySuggestedFolderId(
    userId: string,
    suggestedFolderId: string,
  ) {
    return await this.postModel
      .find({ userId: userId })
      .populate<{
        aiClassificationId: AIClassification;
      }>({
        path: 'aiClassificationId',
        match: { deletedAt: null, suggestedFolderId: suggestedFolderId },
      })
      .sort({ createdAt: -1 })
      .select('_id')
      .exec();
  }

  async findPostsBySuggestedFolderIds(
    userId: string,
    classificationIds: string[],
  ) {
    const targetPosts = await this.postModel
      .find({
        userId: userId,
        aiClassificationId: {
          $in: classificationIds,
        },
      })
      .select({
        _id: 1,
      })
      .exec();
    const targetPostsIds = targetPosts.map((post) => post._id.toString());
    return targetPostsIds;
  }

  async updateFolderId(postId: string, suggestedFolderId: string) {
    await this.postModel
      .updateOne({ _id: postId }, { $set: { folderId: suggestedFolderId } })
      .exec();
  }
  async findAndupdateFolderId(
    userId: string,
    postId: string,
    suggestedFolderId: string,
  ) {
    return await this.postModel
      .findOneAndUpdate(
        { _id: postId, userId },
        { $set: { folderId: suggestedFolderId } },
      )
      .exec();
  }

  async updatePost(
    userId: string,
    postId: string,
    updateFields: Partial<PostUpdateableFields>,
  ) {
    const updateResult = await this.postModel
      .updateOne(
        {
          _id: postId,
          userId: userId,
        },
        {
          $set: {
            ...updateFields,
          },
        },
      )
      .exec();

    if (!updateResult.modifiedCount) {
      throw new NotFoundException(P001);
    }
    return updateResult;
  }

  async findPostByIdForAIClassification(postId: string) {
    const post = await this.postModel
      .findOne({
        _id: postId,
      })
      .lean();
    if (!post) {
      throw new NotFoundException('Post를 찾을 수 없습니다.');
    }
    return post;
  }

  async updatePostClassificationForAIClassification(
    postAiStatus: PostAiStatus,
    postId: string | null,
    classificationId: string | null,
    description: string | null,
  ) {
    const updatedPost = await this.postModel
      .updateOne(
        {
          _id: postId,
        },
        {
          $set: {
            aiClassificationId: classificationId,
            description: description,
            aiStatus: postAiStatus,
          },
        },
      )
      .exec();
    return updatedPost;
  }

  // 해당 이슈로 인해 임시로 any타입 명시
  // https://github.com/microsoft/TypeScript/issues/42873
  async deletePost(
    userId: string,
    postId: string,
    aiClassificationId?: string,
  ): Promise<any> {
    const deleteResult = await this.postModel
      .deleteOne({
        _id: postId,
        userId: userId,
      })
      .exec();
    // If deletion faild, deletedCount will return 0
    if (!deleteResult.deletedCount) {
      throw new NotFoundException(P001);
    }
    if (aiClassificationId) {
      await this.aiClassificationModel
        .deleteOne({
          _id: aiClassificationId,
        })
        .exec();
    }
    return deleteResult;
  }

  async deleteMany(param: FilterQuery<PostDocument>) {
    await this.postModel.deleteMany(param);
    1;
  }
}
