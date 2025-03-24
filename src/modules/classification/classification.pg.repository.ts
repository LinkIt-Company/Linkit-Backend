import { Injectable } from '@nestjs/common';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { AIClassification } from '@src/infrastructure/database/entities/ai-classification.entity';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { ClassificationFolderWithCount } from './dto/classification.dto';

@Injectable()
export class ClassificationPGRepository extends Repository<AIClassification> {
  constructor(private dataSource: DataSource) {
    super(AIClassification, dataSource.createEntityManager());
  }

  async countClassifiedPostByUserId(userId: string) {
    const userFolders = await this.dataSource.getRepository('folders').find({
      where: {
        userId: userId,
        type: Not(FolderType.DEFAULT),
      },
      select: ['id'],
    });

    const folderIds = userFolders.map((folder) => folder.id);
    const classifiedCount = await this.count({
      where: {
        suggestedFolderId: In(folderIds),
        deletedAt: IsNull(),
      },
    });
    return classifiedCount;
  }

  async findById(classificationId: string) {
    return await this.findOne({
      where: { id: classificationId },
    });
  }

  async getClassificationPostCount(
    userId: string,
    suggestedFolderId?: string,
  ): Promise<number> {
    const qb = this.createQueryBuilder('classification')
      .leftJoin('posts', 'post', 'post.aiClassificationId = classification.id')
      .where('classification.deletedAt IS NULL')
      .andWhere('post.userId = :userId', { userId });

    if (suggestedFolderId) {
      qb.andWhere('classification.suggestedFolderId = :suggestedFolderId', {
        suggestedFolderId,
      });
    }

    return await qb.getCount();
  }

  async createClassification(
    url: string,
    description: string,
    keywords: string[],
    suggestedFolderId: string,
  ) {
    const classification = this.create({
      suggestedFolderId,
      url,
      description,
      keywords,
      completedAt: new Date(),
    });

    return await this.save(classification);
  }

  async findContainedFolderByUserId(
    userId: string,
  ): Promise<ClassificationFolderWithCount[]> {
    const result: ClassificationFolderWithCount[] =
      await this.createQueryBuilder('classification')
        .select([
          'folder.id as "folderId"',
          'folder.name as "folderName"',
          'COUNT(classification.id) as "postCount"',
          'CASE WHEN folder.visible = true THEN false ELSE true END as "isAIGenerated"',
        ])
        .leftJoin(
          'folders',
          'folder',
          'folder.id = classification.suggestedFolderId',
        )
        .where('classification.deletedAt IS NULL')
        .andWhere('folder.userId = :userId', { userId })
        .andWhere('folder.type != :type', { type: FolderType.DEFAULT })
        .groupBy('folder.id')
        .addGroupBy('folder.name')
        .addGroupBy('folder.visible')
        .orderBy('"postCount"', 'DESC')
        .addOrderBy('folder.createdAt', 'DESC')
        .getRawMany();

    return result;
  }

  async deleteBySuggestedFolderId(suggestedFolderId: string) {
    await this.update(
      {
        suggestedFolderId,
        deletedAt: IsNull(),
      },
      { deletedAt: new Date() },
    );
  }

  async deleteManyBySuggestedFolderIdList(
    suggestedFolderIdList: string[],
  ): Promise<boolean> {
    await this.update(
      { suggestedFolderId: In(suggestedFolderIdList) },
      { deletedAt: new Date() },
    );

    return true;
  }

  async getClassificationBySuggestedFolderId(suggestedFolderId: string) {
    const classifications = await this.find({
      where: {
        suggestedFolderId,
        deletedAt: IsNull(),
      },
      select: ['id'],
    });

    return classifications.map((classification) => classification.id);
  }
}
