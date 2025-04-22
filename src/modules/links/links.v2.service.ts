import { Injectable } from '@nestjs/common';

@Injectable()
export class LinksService {
  async validateLink(link: string): Promise<boolean> {
    try {
      new URL(link);
      return true;
    } catch (err) {
      return false;
    }
  }
}
