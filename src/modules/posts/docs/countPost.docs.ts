import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const CountPostDocs = applyDecorators(
  ApiOperation({
    summary: '피드 개수 반환',
    description: '반환은 단일 정수타입입니다!',
  }),
  ApiOkResponse({
    type: Number,
  }),
);
