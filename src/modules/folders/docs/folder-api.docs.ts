import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  FolderListResponse,
  FolderPostResponse,
  FolderResponse,
} from '../responses';

export const CreateFolderDocs = applyDecorators(
  ApiOperation({
    summary: '폴더 생성 API',
  }),
  ApiResponse({
    type: FolderResponse,
    isArray: true,
  }),
  ApiBadRequestResponse({
    description: ['F001'].join(','),
  }),
);

export const FindAFolderListDocs = applyDecorators(
  ApiOperation({
    summary: '내 폴더 목록 조회',
    description:
      'defaultFolders에는 자동으로 생성되는 폴더, customFolders에는 유저가 생성한 폴더들이 감',
  }),
  ApiResponse({
    type: FolderListResponse,
  }),
);

export const FindFolderDocs = applyDecorators(
  ApiOperation({
    summary: '폴더 단일 조회',
    description: '',
  }),
  ApiResponse({
    type: FolderResponse,
  }),
  ApiNotFoundResponse({
    description: ['F002'].join(', '),
  }),
);

export const FindLinksInFolderDocs = applyDecorators(
  ApiOperation({
    summary: '폴더 내 링크 목록 조회',
    description: '',
  }),
  ApiResponse({
    type: FolderPostResponse,
  }),
);

export const UpdateFolderDocs = applyDecorators(
  ApiOperation({
    summary: '폴더 수정 API',
  }),
  ApiResponse({
    type: FolderResponse,
  }),
  ApiNotFoundResponse({
    description: ['F002', 'F003'].join(', '),
  }),
);

export const DeleteFolderDocs = applyDecorators(
  ApiOperation({
    summary: '폴더 삭제 API',
  }),
  ApiNotFoundResponse({
    description: ['F002'].join(', '),
  }),
);
