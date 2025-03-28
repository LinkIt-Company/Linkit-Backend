import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordWebhookProvider } from './discord-webhook.provider';

@Injectable()
export class DiscordErrorWebhookProvider extends DiscordWebhookProvider {
  protected webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.webhookUrl = this.configService.get('DISCORD_ERROR_WEBHOOK_URL');
  }

  public async send(content: string) {
    await super.send(this.webhookUrl, content);
  }
}
