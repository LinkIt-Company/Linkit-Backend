import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

export const UpdatePostFolderDocs = applyDecorators(
  ApiOperation({
    summary: '피드 폴더 변경',
  }),
  ApiNotFoundResponse({
    description: ['P001', 'F002'].join(', '),
  }),
);
