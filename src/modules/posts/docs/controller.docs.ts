import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export const PostControllerDocs = applyDecorators(
  ApiTags('posts'),
  ApiBearerAuth(),
);
