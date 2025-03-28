import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RetrievePostResponse } from '../response';

export const RetrievePostDocs = applyDecorators(
  ApiOperation({
    summary: '단일 피드 조회',
  }),
  ApiOkResponse({
    type: RetrievePostResponse,
  }),
  ApiNotFoundResponse({
    description: ['P001'].join(','),
  }),
);
