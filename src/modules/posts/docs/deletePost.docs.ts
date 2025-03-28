import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

export const DeletePostDocs = applyDecorators(
  ApiOperation({
    summary: '피드 삭제',
  }),
  ApiNotFoundResponse({
    description: 'P001',
  }),
);
