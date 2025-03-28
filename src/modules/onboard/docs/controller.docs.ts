import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const OnBoardControllerDocs = applyDecorators(ApiTags('On-Board'));
