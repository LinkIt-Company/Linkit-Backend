import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListPostResponse } from '../response';

export const ListPostDocs = applyDecorators(
  ApiOperation({
    summary: '전체 피드 조회',
  }),
  ApiResponse({
    type: ListPostResponse,
  }),
);
