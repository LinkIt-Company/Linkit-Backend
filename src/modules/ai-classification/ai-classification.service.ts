import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '@src/infrastructure/ai/ai.service';
import { AiClassificationPayload } from '@src/infrastructure/aws-lambda/type';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { ClassficiationRepository } from '../classification/classification.repository';
import { FolderRepository } from '../folders/folders.repository';
import { KeywordsRepository } from '../keywords/keyword.repository';
import { MetricsRepository } from '../metrics/metrics.repository';
import { PostKeywordsRepository } from '../posts/postKeywords.repository';
import { PostAiStatus } from '../posts/posts.constant';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class AiClassificationService {
  constructor(
    private readonly aiService: AiService,
    private readonly config: ConfigService,
    private readonly classificationRepository: ClassficiationRepository,
    private readonly folderRepository: FolderRepository,
    private readonly postRepository: PostsRepository,
    private readonly keywordsRepository: KeywordsRepository,
    private readonly postKeywordsRepository: PostKeywordsRepository,
    private readonly metricsRepository: MetricsRepository,
  ) {}

  async execute(payload: AiClassificationPayload) {
    try {
      // Map - (Folder Name):(Folder ID)

      const folderMapper = {};
      payload.folderList.forEach((folder) => {
        folderMapper[folder.name] = folder.id;
      });

      // NOTE: AI 요약 요청
      const start = process.hrtime();
      if (payload.postContent.length < 800) {
        try {
          const puppeteerURL = this.config.get<string>('PUPPETEER_POOL_URL');
          const response = await fetch(`http://${puppeteerURL}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: payload.url,
            }), // JSON 데이터를 문자열로 변환
          });
          if (response.ok) {
            const responseData = await response.json();
            const content = responseData['result']['body'];
            payload.postContent = content;
            const title = responseData['result']['title'];
            const ogImage = response['result']['ogImage'];
            await this.postRepository.updatePost(
              payload.userId,
              payload.postId,
              {
                title: title,
                thumbnailImgUrl: ogImage,
              },
            );
          } else {
            console.log('Fail to request puppeteer pool');
            throw new Error();
          }
        } catch (err) {
          console.log(err);
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
        const newFolder = await this.folderRepository.create(
          payload.userId,
          summarizeUrlContent.response.category,
          FolderType.CUSTOM,
          false,
        );
        folderMapper[summarizeUrlContent.response.category] =
          newFolder._id.toString();
      }

      const end = process.hrtime(start);
      const timeSecond = end[0] + end[1] / 1e9;

      const postId = payload.postId;
      let post = null;
      let classificationId = null;
      let postAiStatus = PostAiStatus.FAIL;

      // NOTE : 요약 성공 시 classification 생성, post 업데이트
      if (summarizeUrlContent.success) {
        let folderId = folderMapper[summarizeUrlContent.response.category];

        if (!folderId) {
          folderId = await this.folderRepository.getDefaultFolder(
            payload.userId,
          );
        }

        post =
          await this.postRepository.findPostByIdForAIClassification(postId);

        // 기존에 디폴트 폴더 안막은것들이 있어서... 우선은 다 불러와서 필터링 하는 방식으로 했어용
        const defaultFolders = await this.folderRepository.getDefaultFolders(
          post.userId.toString(),
        );
        const defaultFolderIds = defaultFolders.map((folder) =>
          folder._id.toString(),
        );
        const isDefaultFolder = defaultFolderIds.includes(
          post.folderId.toString(),
        );
        postAiStatus = PostAiStatus.SUCCESS;
        // 디폴트 폴더인 경우에만 classification 생성
        if (isDefaultFolder) {
          const classification =
            await this.classificationRepository.createClassification(
              post.url,
              summarizeUrlContent.response.summary,
              summarizeUrlContent.response.keywords,
              folderId,
            );

          // Post에 추가하기 위한 classificaiton ID
          classificationId = classification._id.toString();
        }

        // Keyword는 성공여부 상관없이 생성
        const keywords = await this.keywordsRepository.createMany(
          summarizeUrlContent.response.keywords,
        );

        const keywordIds = keywords.map((keyword) => keyword._id.toString());
        await this.postKeywordsRepository.createPostKeywords(
          postId,
          keywordIds,
        );
      }

      // Save metrics
      await this.metricsRepository.createMetrics(
        summarizeUrlContent.success,
        timeSecond,
        payload.url,
        payload.postId,
      );

      await this.postRepository.updatePostClassificationForAIClassification(
        postAiStatus,
        postId,
        classificationId,
        summarizeUrlContent.success === true
          ? summarizeUrlContent.response.summary
          : summarizeUrlContent.thumbnailContent,
      );
      return summarizeUrlContent;
    } catch (error: unknown) {
      return { success: false, error };
    }
  }
}
