import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export const ClassificationControllerDocs = applyDecorators(
  ApiTags('AI classification API'),
  ApiBearerAuth(),
);
