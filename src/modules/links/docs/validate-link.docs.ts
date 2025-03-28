import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidateLinkResponse } from '../responses';

export const ValidateLinkDocs = applyDecorators(
  ApiOperation({
    summary: '링크 유효 체크 API',
    description:
      '전달받은 링크가 유효한지 체크 후 isValidate라는 플리그 필드로 전닲',
  }),
  ApiResponse({
    type: ValidateLinkResponse,
  }),
);
