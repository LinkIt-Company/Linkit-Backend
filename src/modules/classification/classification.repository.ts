import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AIClassification, Folder } from '@src/infrastructure';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { ClassificationFolderWithCount } from './dto/classification.dto';

@Injectable()
export class ClassficiationRepository {
  constructor(
    @InjectModel(AIClassification.name)
    private readonly aiClassificationModel: Model<AIClassification>,
    @InjectModel(Folder.name)
    private readonly folderModel: Model<Folder>,
  ) {}

  async countClassifiedPostByUserId(userId: string) {
    // Get folder list with '_id' projection
    const userFolders = await this.folderModel.find(
      {
        userId: userId,
        type: {
          $ne: FolderType.DEFAULT,
        },
      },
      {
        _id: true,
      },
    );
    const folderIds = userFolders.map((folder) => folder._id);
    const classifiedCount = await this.aiClassificationModel.countDocuments({
      suggestedFolderId: {
        $in: folderIds,
      },
      deletedAt: null,
    });
    return classifiedCount;
  }

  async findById(classificationId: string) {
    const classification = await this.aiClassificationModel
      .findById(classificationId)
      .exec();
    return classification;
  }

  async getClassificationPostCount(
    userId: string,
    suggestedFolderId?: string,
  ): Promise<number> {
    const result = await this.aiClassificationModel
      .aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'aiClassificationId',
            as: 'post',
          },
        },
        {
          $unwind: '$post',
        },
        {
          $match: {
            'post.userId': new Types.ObjectId(userId),
            ...(suggestedFolderId && {
              suggestedFolderId: new Types.ObjectId(suggestedFolderId),
            }),
          },
        },
        {
          $count: 'count',
        },
      ])
      .exec();

    const count = result[0]?.count || 0;
    return count;
  }

  async createClassification(
    url: string,
    description: string,
    keywords: string[],
    suggestedFolderId: string,
  ) {
    const classification = await this.aiClassificationModel.create({
      suggestedFolderId: suggestedFolderId,
      url: url,
      description: description,
      keywords: keywords,
      completedAt: new Date(),
    });
    return classification;
  }

  async findContainedFolderByUserId(
    userId: Types.ObjectId,
  ): Promise<ClassificationFolderWithCount[]> {
    return await this.aiClassificationModel
      .aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $lookup: {
            from: 'folders',
            localField: 'suggestedFolderId',
            foreignField: '_id',
            as: 'folder',
          },
        },
        {
          $unwind: '$folder',
        },
        {
          $match: {
            'folder.userId': userId,
            'folder.type': { $ne: 'default' },
          },
        },
        {
          $group: {
            _id: '$suggestedFolderId',
            folderName: { $first: '$folder.name' },
            postCount: { $sum: 1 },
            folderCreatedAt: { $first: '$folder.createdAt' },
            folderVisible: { $first: '$folder.visible' },
          },
        },
        {
          $sort: {
            postCount: -1,
            folderCreatedAt: -1,
          },
        },
        {
          $project: {
            _id: 0,
            folderId: { $toString: '$_id' },
            folderName: 1,
            postCount: 1,
            isAIGenerated: {
              $cond: {
                if: { $eq: ['$folderVisible', true] },
                then: false,
                else: true,
              },
            },
          },
        },
      ])
      .exec();
  }

  async delete(id: string) {
    await this.aiClassificationModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }

  async deleteBySuggestedFolderId(suggestedFolderId: string) {
    await this.aiClassificationModel
      .updateMany(
        { suggestedFolderId: suggestedFolderId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();
  }

  async deleteManyBySuggestedFolderIdList(
    suggestedFolderId: string[] | string,
  ): Promise<boolean> {
    await this.aiClassificationModel
      .updateMany(
        { suggestedFolderId: { $in: suggestedFolderId } },
        {
          deletedAt: new Date(),
        },
      )
      .exec();
    return true;
  }

  async getClassificationBySuggestedFolderId(suggestedFolderId: string) {
    const classifications = await this.aiClassificationModel
      .find({
        suggestedFolderId: suggestedFolderId,
        deletedAt: null,
      })
      .select({ _id: 1 })
      .exec();
    const classificationIds = classifications.map((classification) =>
      classification._id.toString(),
    );
    return classificationIds;
  }
}
