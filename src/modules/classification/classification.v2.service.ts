import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationQuery, sum } from '@src/common';
import { FoldersPGRepository } from '../folders/folders.pg.repository';
import { PostsPGRepository } from '../posts/posts.pg.repository';
import { ClassificationPGRepository } from './classification.pg.repository';
import { ClassificationFolderWithCount } from './dto/classification.dto';
import { C001 } from './error';

@Injectable()
export class ClassificationV2Service {
  constructor(
    private readonly classificationRepository: ClassificationPGRepository,
    private readonly postRepository: PostsPGRepository,
    private readonly folderRepository: FoldersPGRepository,
  ) {}

  async countClassifiedPost(userId: string): Promise<number> {
    return await this.classificationRepository.countClassifiedPostByUserId(
      userId,
    );
  }

  async getFolderNameList(
    userId: string,
  ): Promise<ClassificationFolderWithCount[]> {
    return await this.classificationRepository.findContainedFolderByUserId(
      userId,
    );
  }

  async getPostList(userId: string, pagingQuery: PaginationQuery) {
    const { count, orderedFolderIdList } =
      await this.getFolderCountAndOrder(userId);

    if (orderedFolderIdList.length === 0) {
      return { count: 0, classificationPostList: [] };
    }
    const offset = (pagingQuery.page - 1) * pagingQuery.limit;
    const classificationPostList =
      await this.postRepository.findAndSortBySuggestedFolderIds(
        userId,
        orderedFolderIdList,
        offset,
        pagingQuery.limit,
      );

    return { count, classificationPostList };
  }

  async getFolderCountAndOrder(userId: string) {
    const orderedFolderList =
      await this.classificationRepository.findContainedFolderByUserId(userId);

    const count = sum(orderedFolderList, (folder) => Number(folder.postCount));
    const orderedFolderIdList = orderedFolderList.map(
      (folder) => folder.folderId,
    );

    return { count, orderedFolderIdList };
  }

  async getPostListInFolder(
    userId: string,
    folderId: string,
    pagingQuery: PaginationQuery,
  ) {
    const offset = (pagingQuery.page - 1) * pagingQuery.limit;

    const [count, classificationPostList] = await Promise.all([
      this.classificationRepository.getClassificationPostCount(
        userId,
        folderId,
      ),
      this.postRepository.findBySuggestedFolderId(
        userId,
        folderId,
        offset,
        pagingQuery.limit,
      ),
    ]);

    return { count, classificationPostList };
  }

  async moveAllPostTosuggestionFolder(
    userId: string,
    suggestedFolderId: string,
  ): Promise<void> {
    const postIdList = (
      await this.postRepository.findFolderIdsBySuggestedFolderId(
        userId,
        suggestedFolderId,
      )
    ).map((post) => post.id);

    if (postIdList.length > 0) {
      await this.postRepository.updatePostListFolder(
        userId,
        postIdList,
        suggestedFolderId,
      );
    }

    await this.classificationRepository.deleteManyBySuggestedFolderIdList(
      suggestedFolderId,
    );
  }

  async moveAllPostTosuggestionFolderV2(
    userId: string,
    suggestedFolderId: string,
  ): Promise<boolean> {
    await this.folderRepository.makeFolderVisible(suggestedFolderId);

    const targetClassificationIds =
      await this.classificationRepository.getClassificationBySuggestedFolderId(
        suggestedFolderId,
      );

    const targetPostIds =
      await this.postRepository.findPostsBySuggestedFolderIds(
        userId,
        targetClassificationIds,
      );

    if (targetPostIds.length > 0) {
      await this.postRepository.updatePostListFolder(
        userId,
        targetPostIds,
        suggestedFolderId,
      );
    }

    await this.classificationRepository.deleteManyBySuggestedFolderIdList(
      suggestedFolderId,
    );

    return true;
  }

  async moveOnePostTosuggestionFolder(
    userId: string,
    postId: string,
    suggestedFolderId: string,
  ): Promise<void> {
    await this.folderRepository.makeFolderVisible(suggestedFolderId);

    const post = await this.postRepository.findOne({
      where: { id: postId, userId },
    });

    await this.postRepository.findAndupdateFolderId(
      userId,
      postId,
      suggestedFolderId,
    );

    if (post.aiClassificationId) {
      await this.classificationRepository.softDelete(post.aiClassificationId);
    }
  }

  async abortClassification(userId: string, postId: string): Promise<boolean> {
    const post = await this.postRepository.findPostOrThrow({
      id: postId,
    });

    if (!post.aiClassificationId) {
      throw new BadRequestException(C001);
    }

    const classification = await this.classificationRepository.findById(
      post.aiClassificationId,
    );

    if (!classification) {
      throw new BadRequestException(C001);
    }

    await this.classificationRepository.softDelete(classification.id);
    return true;
  }

  async deleteClassificationBySuggestedFolderId(
    suggestedFolderId: string[] | string,
  ): Promise<boolean> {
    return await this.classificationRepository.deleteManyBySuggestedFolderIdList(
      suggestedFolderId,
    );
  }
}
