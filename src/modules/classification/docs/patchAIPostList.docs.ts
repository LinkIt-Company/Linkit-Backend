import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const PatchAIPostListDocs = applyDecorators(
  ApiOperation({
    summary: 'Post 모두 이동',
    description: '추천 폴더 안에 들어있는 Post(링크)를 추천 폴더로 전부 이동',
  }),
  ApiResponse({
    type: Boolean,
  }),
  ApiBearerAuth(),
);
