import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export const ListOnBoardKeywordsDocs = applyDecorators(
  ApiProperty({
    description:
      'Onboard 키워드를 반환합니다. 필요에 따라 반환 개수 제한해주시면 됩니다.',
  }),
);
