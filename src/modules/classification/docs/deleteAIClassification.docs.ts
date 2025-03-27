import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteAIClassificationDocs = applyDecorators(
  ApiOperation({
    summary: 'ai 분류 추천 리스트에서 삭제',
    description:
      'ai 분류 추천 리스트에서 삭제합니다. 나중에 읽을 폴더에 계속 위치됩니다.',
  }),
  ApiResponse({}),
  ApiBearerAuth(),
);
