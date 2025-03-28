import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordWebhookProvider } from './discord-webhook.provider';

@Injectable()
export class DiscordAIWebhookProvider extends DiscordWebhookProvider {
  protected readonly webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.webhookUrl = this.configService.get('DISCORD_AI_WEBHOOK_URL');
  }

  public async send(content: string) {
    await super.send(this.webhookUrl, content);
  }
}
