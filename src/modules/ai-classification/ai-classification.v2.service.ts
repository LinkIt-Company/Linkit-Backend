import { Injectable } from '@nestjs/common';
import { CONTENT_LEAST_LIMIT } from '@src/common/constant';
import { AiService } from '@src/infrastructure/ai/ai.service';
import { AiClassificationPayload } from '@src/infrastructure/aws-lambda/type';
import { Post } from '@src/infrastructure/database/entities/post.entity';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { PuppeteerPoolService } from '@src/infrastructure/puppeteer-pool/puppeteer-pool.service';
import { ClassificationPGRepository } from '@src/modules/classification/classification.pg.repository';
import { FoldersPGRepository } from '@src/modules/folders/folders.pg.repository';
import { KeywordsPGRepository } from '@src/modules/keywords/keyword.pg.repository';
import { PostKeywordsPGRepository } from '@src/modules/posts/postKeywords.pg.repository';
import { PostAiStatus } from '@src/modules/posts/posts.constant';
import { PostsPGRepository } from '@src/modules/posts/posts.pg.repository';

@Injectable()
export class AiClassificationV2Service {
  constructor(
    private readonly aiService: AiService,
    private readonly classificationRepository: ClassificationPGRepository,
    private readonly folderRepository: FoldersPGRepository,
    private readonly postRepository: PostsPGRepository,
    private readonly keywordsRepository: KeywordsPGRepository,
    private readonly postKeywordsRepository: PostKeywordsPGRepository,
    private readonly puppeteer: PuppeteerPoolService,
  ) {}

  async execute(payload: AiClassificationPayload) {
    try {
      const folderMapper = new Map();
      for (const folder of payload.folderList) {
        folderMapper.set(folder.name, folder.id);
      }

      if (payload.postContent.length < CONTENT_LEAST_LIMIT) {
        const { ok, body } = await this.puppeteer.invokeRemoteSessionParser(
          payload.url,
        );
        if (ok) {
          const content = body['result']['body'];
          const title = body['result']['title'];
          const ogImage = body['result']['ogImage'];

          payload.postContent = content;
          await this.postRepository.updatePost(payload.userId, payload.postId, {
            title: title,
            thumbnailImgUrl: ogImage,
          });
        }
      }

      const summarizeUrlContent = await this.aiService.summarizeLinkContent(
        payload.postContent,
        payload.postThumbnailContent,
        Object.keys(folderMapper),
        payload.url,
      );

      // If summarize result is success and is not user category, create new foler
      if (summarizeUrlContent.success && !summarizeUrlContent.isUserCategory) {
        /**
         *         payload.userId,
         *         summarizeUrlContent.response.category,
         *         FolderType.CUSTOM,
         *         false,
         */
        const newFolder = await this.folderRepository.save({
          userId: payload.userId,
          name: summarizeUrlContent.response.category,
          type: FolderType.CUSTOM,
          visible: false,
        });
        folderMapper[summarizeUrlContent.response.category] = newFolder.id;
      }

      const postId = payload.postId;
      let post: Post = null;
      let classificationId = null;
      let postAiStatus = PostAiStatus.FAIL;

      if (summarizeUrlContent.success) {
        let folderId = folderMapper.get(summarizeUrlContent.response.category);
        if (!folderId) {
          folderId = await this.folderRepository.getDefaultFolder(
            payload.userId,
          );
        }

        post =
          await this.postRepository.findPostByIdForAIClassification(postId);

        const defaultFolders = await this.folderRepository.getDefaultFolders(
          post.userId,
        );
        const defaultFolderIds = defaultFolders.map((folder) => folder.id);
        const isDefaultFolder = defaultFolderIds.includes(
          post.folderId.toString(),
        );
        postAiStatus = PostAiStatus.SUCCESS;

        // Default Folder인 경우에는 Classification 생성함
        if (isDefaultFolder) {
          const classification =
            await this.classificationRepository.createClassification(
              post.url,
              summarizeUrlContent.response.summary,
              summarizeUrlContent.response.keywords,
              folderId,
            );
          classificationId = classification.id;
        }

        // Keyword는 성공 여부 상관없이 생성
        const keywords = await this.keywordsRepository.createMany(
          summarizeUrlContent.response.keywords,
        );

        const keywordIds = keywords.map((keyword) => keyword.id);
        await this.postKeywordsRepository.createPostKeywords(
          postId,
          keywordIds,
        );
      }

      await this.postRepository.updatePostClassificationForAIClassification(
        postAiStatus,
        postId,
        classificationId,
        summarizeUrlContent.success === true
          ? summarizeUrlContent.response.summary
          : summarizeUrlContent.thumbnailContent,
      );
    } catch (error: unknown) {
      return { success: false, error };
    }
  }
}
