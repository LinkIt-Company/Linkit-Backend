import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserResponse } from '../response';

export const CreateUserDocs = applyDecorators(
  ApiOperation({
    summary: '신규 User생성 및 JWT 토큰 발급',
    description:
      'deviceToken이 등록된 적 없는 경우에만 유저를 생성합니다. 기존에 사용자가 없는 경우 있는 경우 모두 JWT Token을 발급합니다.',
  }),
  ApiResponse({
    type: CreateUserResponse,
  }),
);
