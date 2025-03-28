import { SummarizeURLContent } from '@src/infrastructure/ai/types/types';

type SummarizeSuccessType = {
  success: true;
  isUserCategory: boolean;
  response: SummarizeURLContent;
};

type SummarizeFailType = {
  success: false;
  message: string;
  thumbnailContent: string;
};

type SummarizeResultType = SummarizeSuccessType | SummarizeFailType;

export class SummarizeURLContentDto {
  success: boolean;
  isUserCategory?: boolean;
  response?: SummarizeURLContent;
  message?: string;
  thumbnailContent?: string;

  constructor(data: SummarizeResultType) {
    // true를 명시하지 않으면 Discriminate Union이 동작 안함
    this.success = data.success;
    if (data.success === true) {
      this.isUserCategory = data.isUserCategory;
      this.response = data.response;
    } else {
      this.message = data.message;
      this.thumbnailContent = data.thumbnailContent;
    }
  }
}
