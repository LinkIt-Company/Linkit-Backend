import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export const FolderControllerDocs = applyDecorators(
  ApiTags('Folder API'),
  ApiBearerAuth(),
);
