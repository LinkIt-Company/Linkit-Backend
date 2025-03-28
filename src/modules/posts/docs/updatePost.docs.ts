import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

export const UpdatePostDocs = applyDecorators(
  ApiOperation({
    summary: '피드 정보 변경',
  }),
  ApiNotFoundResponse({
    description: 'P001',
  }),
);
