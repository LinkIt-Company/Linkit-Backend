import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AIPostListResponse } from '../response/ai-post-list.dto';

export const GetAIPostListDocs = applyDecorators(
  ApiOperation({
    summary: 'Post(링크) 리스트',
    description: 'AI 분류 추천된 링크 리스트.',
  }),
  ApiResponse({
    type: AIPostListResponse,
  }),
  ApiBearerAuth(),
);
