import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const PatchAIPostDocs = applyDecorators(
  ApiOperation({
    summary: 'Post 하나 이동',
    description: '추천해준 폴더로 post이동. postId가 필요합니다.',
  }),
  ApiResponse({}),
  ApiBearerAuth(),
);
