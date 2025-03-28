import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { OpenAIError, RateLimitError } from 'openai';
import { TOKEN_LEAST_LIMIT } from '@src/common/constant';
import { promptTokenCalculator } from '@src/common/utils/tokenizer';
import { onBoardCategoryList } from '@src/modules/onboard/onboard.const';
import { DiscordAIWebhookProvider } from '../discord/discord-ai-webhook.provider';
import { gptVersion } from './ai.constant';
import { SummarizeURLContentDto } from './dto';
import {
  AiClassificationFunctionResult,
  getKeywordsFromURLContentFunction,
  summarizeURLContentFunctionFactory,
} from './functions';
import { SummarizeURLContent } from './types/types';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly discordAIWebhookProvider: DiscordAIWebhookProvider,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async summarizeLinkContent(
    content: string,
    baseThumbnailContent: string,
    userFolderList: string[],
    url: string,
    temperature = 0.5,
  ): Promise<SummarizeURLContentDto> {
    try {
      // 사용자 폴더 + 서버에서 임의로 붙여주는 폴더 리스트
      // Should prevent redundancy
      const folderLists = Array.from(
        new Set([...userFolderList, ...onBoardCategoryList]),
      );

      // Calculate post content
      const tokenCount = promptTokenCalculator(content, folderLists);
      if (tokenCount <= TOKEN_LEAST_LIMIT) {
        return new SummarizeURLContentDto({
          success: false,
          message: 'Too low input token count',
          thumbnailContent: baseThumbnailContent,
        });
      }
      // AI Summary 호출
      const promptResult = await this.invokeAISummary(
        content,
        folderLists,
        url,
        temperature,
      );

      // Function Call 결과
      const summaryResult: SummarizeURLContent = JSON.parse(
        promptResult.choices[0].message.tool_calls[0].function.arguments,
      );
      // 분류된 카테고리가 사용자 카테고리 범위에 속해있는지에 대해 검사
      const checkIsUserCategory = userFolderList.includes(
        summaryResult.category,
      );
      return new SummarizeURLContentDto({
        success: true,
        isUserCategory: checkIsUserCategory,
        response: summaryResult,
      });
    } catch (err) {
      return new SummarizeURLContentDto({
        success: false,
        message:
          err instanceof RateLimitError
            ? '크레딧을 모두 소진하였습니다.'
            : err instanceof OpenAIError
              ? err.message
              : '요약에 실패하였습니다.',
        thumbnailContent: baseThumbnailContent,
      });

      // return new SummarizeURLContentDto({
      //   success: false,
      //   message:
      //     err instanceof RateLimitError
      //       ? '크레딧을 모두 소진하였습니다.'
      //       : err instanceof OpenAIError
      //         ? err.message
      //         : '요약에 실패하였습니다.',
      // });
    }
  }

  public async getKeywords(content: string) {
    const promptResult = await this.openai.chat.completions.create(
      {
        model: gptVersion,
        messages: [
          {
            role: 'system',
            content: '한글로 답변 부탁해',
          },
          {
            role: 'user',
            content: `주어진 글에 대해 요약하고 키워드 추출, 분류 부탁해

${content}
            `,
          },
        ],
        tools: [
          {
            type: 'function',
            function: getKeywordsFromURLContentFunction,
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'summarizeURL' },
        },
        temperature: 0.5,
      },
      {
        maxRetries: 5,
      },
    );

    const functionResult: AiClassificationFunctionResult = JSON.parse(
      promptResult.choices[0].message.tool_calls[0].function.arguments,
    );
    return functionResult;
  }

  public async getKeywordEmbeddings(content: string) {
    try {
      const promptResult = await this.openai.embeddings.create(
        {
          model: 'text-embedding-3-large',
          input: content,
        },
        {
          maxRetries: 5,
        },
      );

      const result = promptResult.data.map((embedding) => embedding.embedding);
      return result[0];
    } catch (err) {
      throw new Error(
        err instanceof OpenAIError
          ? err.message
          : '키워드 벡터 임베딩 생성에 실패하였습니다.',
      );
    }
  }

  private async invokeAISummary(
    content: string,
    folderList: string[],
    url: string,
    temperature: number,
  ) {
    let elapsedTime: number = 0;
    const startTime = new Date();
    const promptResult = await this.openai.chat.completions.create(
      {
        model: gptVersion,
        messages: [
          {
            role: 'system',
            content: '한글로 답변 부탁해',
          },
          {
            role: 'user',
            content: `주어진 글에 대해 요약하고 키워드 추출, 분류 부탁해

${content}
            `,
          },
        ],
        tools: [
          {
            type: 'function',
            function: summarizeURLContentFunctionFactory(folderList),
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'summarizeURL' },
        },
        temperature: temperature,
      },
      {
        maxRetries: 5,
      },
    );

    elapsedTime = new Date().getTime() - startTime.getTime();

    const functionResult: AiClassificationFunctionResult = JSON.parse(
      promptResult.choices[0].message.tool_calls[0].function.arguments,
    );

    await this.discordAIWebhookProvider.send(
      [
        `**AI 요약 실행 시간: ${elapsedTime}ms**`,
        `**Input**`,
        `- URL : ${url}`,
        `- 인풋 폴더 : [${folderList.join(', ')}]`,
        `**Output**`,
        `- 사용 모델 : ${promptResult.model}`,
        `- 요약 : ${functionResult.summary}`,
        `- 추출 키워드 : ${functionResult.keywords.join(', ')}`,
        `- 매칭 폴더명 : ${functionResult.category}`,
        `- Input Token : ${promptResult.usage.prompt_tokens}`,
        `- Output Token : ${promptResult.usage.completion_tokens}`,
        `- Total Token : ${promptResult.usage.total_tokens}`,
      ].join('\n'),
    );

    return promptResult;
  }
}
