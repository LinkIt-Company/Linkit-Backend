import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const UserControllerDocs = applyDecorators(ApiTags('User API'));
