import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Types } from 'mongoose';

export const CreatePostDocs = applyDecorators(
  ApiOperation({
    summary: '피드 링크 저장',
  }),
  ApiResponse({
    type: Types.ObjectId,
  }),
);
