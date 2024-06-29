import { Controller, Get, Query } from '@nestjs/common';
import { LinksService } from './links.service';
import { ValidateLinkResponse } from './responses';
import { LinksControllerDocs, ValidateLinkDocs } from './docs';

@LinksControllerDocs
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @ValidateLinkDocs
  @Get('/validation')
  async validateLink(
    @Query('link') link: string,
  ): Promise<ValidateLinkResponse> {
    const result = await this.linksService.validateLink(link);

    return new ValidateLinkResponse(result);
  }
}
