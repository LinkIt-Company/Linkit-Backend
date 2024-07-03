import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const UpdatePostDocs = applyDecorators(
  ApiOperation({
    summary: 'URL 폴더 변경',
  }),
);
