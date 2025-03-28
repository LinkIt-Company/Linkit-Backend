import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const LinksControllerDocs = applyDecorators(ApiTags('Link API'));
