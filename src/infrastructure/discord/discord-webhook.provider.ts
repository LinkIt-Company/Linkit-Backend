import { IS_LOCAL } from '@src/common/constant';

export class DiscordWebhookProvider {
  protected readonly webhookUrl: string;
  constructor() {}

  public async send(url: string, content: string) {
    if (IS_LOCAL) {
      return;
    }

    await fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  }
}
