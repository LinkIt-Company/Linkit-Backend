import { Global, Module } from '@nestjs/common';
import { DiscordAIWebhookProvider } from './discord-ai-webhook.provider';
import { DiscordErrorWebhookProvider } from './discord-error-webhook.provider';

@Global()
@Module({
  providers: [DiscordAIWebhookProvider, DiscordErrorWebhookProvider],
  exports: [DiscordAIWebhookProvider, DiscordErrorWebhookProvider],
})
export class DiscordModule {}
