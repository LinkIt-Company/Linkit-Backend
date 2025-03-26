import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { DataSource, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { OrderType } from '@src/common';
import { Post } from '@src/infrastructure/database/entities/post.entity';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { ClassificationPostList } from '../classification/dto/classification.dto';
import { P001 } from './error';
import { PostUpdateableFields } from './type/type';

@Injectable()
export class PostsPGRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }

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

    const userPostCount = await this.count({ where: queryFilter });
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
    const queryFilter: FindOptionsWhere<Post> = {
      userId,
    };
    // If isFavorite is not undefined and is typeof boolean
    if (isFavorite) {
      queryFilter.isFavorite = true;
    }

    if (isRead) {
      queryFilter.readAt = Not(IsNull());
    } else if (isRead === false) {
      queryFilter.readAt = IsNull();
    }
    const posts = await this.find({
      where: queryFilter,
      order: {
        createdAt: order,
      },
      skip: skipQuery,
      take: limit,
    });

    return posts;
  }

  async findPostOrThrow(param: FindOptionsWhere<Post>) {
    const post = await this.findOne({ where: param });
    if (!post) {
      throw new NotFoundException(P001);
    }
    return post;
  }

  async updatePostFolder(userId: string, postId: string, folderId: string) {
    const updatedPost = await this.update(
      {
        id: postId,
        userId,
      },
      {
        folderId,
      },
    );

    return updatedPost;
  }

  async updatePostListFolder(
    userId: string,
    postIdList: string[],
    suggestedFolderId: string,
  ) {
    await Promise.all(
      postIdList.map(async (postId) => {
        await this.update(
          { id: postId, userId },
          {
            folderId: suggestedFolderId,
          },
        );
      }),
    );
  }

  async createPost(
    userId: string,
    folderId: string,
    url: string,
    title: string,
    thumbnail: string,
    postAIStatus: PostAiStatus,
  ) {
    const postModel = await this.save({
      folderId: folderId,
      url: url,
      title: title,
      userId: userId,
      readAt: null,
      thumbnailImgUrl: thumbnail,
      aiStatus: postAIStatus,
    });

    return postModel;
  }

  async getPostCountByFolderIds(folderIds: string[]) {
    const posts = await this.createQueryBuilder('post')
      .select('folderId')
      .addSelect('COUNT(id)', 'count')
      .where('folderId IN (:...folderIds)', {
        folderIds,
      })
      .getRawMany<{ folderId: string; postCount: string }>();

    const result = posts.map((folder) => ({
      folderId: folder.folderId,
      postCount: +folder.postCount,
    }));
    return result;
  }

  async findBySuggestedFolderId(
    userId: string,
    suggestedFolderId: string,
    offset: number,
    limit: number,
  ): Promise<ClassificationPostList[]> {
    this.createQueryBuilder('post').where('userId = :userId', { userId });

    return await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.aiClassification', 'aiClassification')
      .where('post.userId = :userId', { userId })
      .andWhere('aiClassification.deletedAt IS NULL')
      .andWhere('aiClassification.suggestedFolderId = :suggestedFolderId', {
        suggestedFolderId,
      })
      .orderBy('post.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .select([
        'aiClassification.suggestedFolderId as folderId',
        'post.id as postId',
        'post.title as title',
        'post.url as url',
        'post.description as description',
        'post.createdAt as createdAt',
        'post.readAt as readAt',
        'post.aiStatus as aiStatus',
        'post.thumbnailImgUrl as thumbnailImgUrl',
        'aiClassification.keywords as keywords',
      ])
      .getRawMany<ClassificationPostList>();
  }

  async getCountByFolderId(folderId: string, isRead?: boolean) {
    const where: FindOptionsWhere<Post> = {
      folderId: folderId,
    };

    if (isRead) {
      where.readAt = Not(IsNull());
    } else if (isRead === false) {
      where.readAt = IsNull();
    }

    const count = await this.count({ where });

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
    const queryFilter: FindOptionsWhere<Post> = {
      folderId: folderId,
    };

    if (isRead) {
      queryFilter['readAt'] = Not(IsNull());
    } else if (isRead === false) {
      queryFilter['readAt'] = null;
    }

    const folders = await this.find({
      where: queryFilter,
      order: { createdAt: order },
      skip: offset,
      take: limit,
    });

    return folders;
  }

  async findFavoritePostCount(userId: string) {
    const count = await this.count({
      where: {
        userId,
        isFavorite: true,
      },
    });

    return count;
  }
  async findAndSortBySuggestedFolderIds(
    userId: string,
    suggestedFolderIds: string[],
    offset: number,
    limit: number,
  ): Promise<ClassificationPostList[]> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select([
        'post.id AS "postId"',
        'post.title AS "title"',
        'post.url AS "url"',
        'post.description AS "description"',
        'post.created_at AS "createdAt"',
        'post.read_at AS "readAt"',
        'post.ai_status AS "aiStatus"',
        'post.thumbnail_img_url AS "thumbnailImgUrl"',
        'ai.keywords AS "keywords"',
        'ai.suggested_folder_id AS "folderId"',
        `array_position(ARRAY[:...suggestedFolderIds]::uuid[], ai.suggested_folder_id) AS "folder_order"`,
      ])
      .from('posts', 'post')
      .innerJoin(
        'ai_classifications',
        'ai',
        'post.ai_classification_id = ai.id',
      )
      .where('post.user_id = :userId', { userId })
      .andWhere('ai.deleted_at IS NULL')
      .andWhere('ai.suggested_folder_id IN (:...suggestedFolderIds)', {
        suggestedFolderIds,
      })
      .setParameter('suggestedFolderIds', suggestedFolderIds)
      .orderBy('folder_order', 'ASC')
      .addOrderBy('post.created_at', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    return result.map((row) => ({
      postId: row.postId,
      folderId: row.folderId,
      title: row.title,
      url: row.url,
      description: row.description,
      createdAt: row.createdAt,
      readAt: row.readAt,
      aiStatus: row.aiStatus,
      thumbnailImgUrl: row.thumbnailImgUrl,
      keywords: row.keywords,
    }));
  }

  async findFolderIdsBySuggestedFolderId(
    userId: string,
    suggestedFolderId: string,
  ) {
    return await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.aiClassification', 'aiClassification')
      .where('post.userId = :userId', { userId })
      .andWhere('aiClassification.deletedAt IS NULL')
      .andWhere('aiClassification.suggestedFolderId = :suggestedFolderId', {
        suggestedFolderId,
      })
      .orderBy('post.createdAt', 'DESC')
      .select('post.id')
      .getMany();
  }

  async findPostsBySuggestedFolderIds(
    userId: string,
    classificationIds: string[],
  ) {
    const targetPosts = await this.createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .andWhere('post.aiClassificationId IN (:...classificationIds)', {
        classificationIds,
      })
      .select('post.id')
      .getMany();

    return targetPosts.map((post) => post.id);
  }

  async updateFolderId(postId: string, suggestedFolderId: string) {
    await this.update({ id: postId }, { folderId: suggestedFolderId });
  }

  async findAndupdateFolderId(
    userId: string,
    postId: string,
    suggestedFolderId: string,
  ) {
    return await this.update(
      { id: postId, userId },
      { folderId: suggestedFolderId },
    );
  }

  async updatePost(
    userId: string,
    postId: string,
    updateFields: Partial<PostUpdateableFields>,
  ) {
    const updateResult = await this.update(
      { id: postId, userId },
      updateFields,
    );

    if (!updateResult.affected) {
      throw new NotFoundException(P001);
    }

    return updateResult;
  }

  async findPostByIdForAIClassification(postId: string) {
    const post = await this.findOne({
      where: { id: postId },
    });

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
    return await this.update(
      { id: postId },
      {
        aiClassificationId: classificationId,
        description: description,
        aiStatus: postAiStatus,
      },
    );
  }

  async deletePost(
    userId: string,
    postId: string,
    aiClassificationId?: string,
  ) {
    const deleteResult = await this.delete({
      id: postId,
      userId: userId,
    });

    if (!deleteResult.affected) {
      throw new NotFoundException(P001);
    }

    if (aiClassificationId) {
      // AIClassification 삭제는 별도 repository에서 처리해야 함
      // await aiClassificationRepository.delete({ id: aiClassificationId });
    }

    return deleteResult;
  }

  async deleteMany(param: FindOptionsWhere<Post>) {
    await this.delete(param);
  }
}
