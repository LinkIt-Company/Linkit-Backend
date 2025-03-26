import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const CountClassificationDocs = applyDecorators(
  ApiOperation({
    summary: 'AI 분류된 개수를 반환합니다',
    description: '반환 데이터 타입은 정수입니다!',
  }),
  ApiResponse({
    status: 200,
    description: '분류된 Post의 개수',
    type: Number,
  }),
);
