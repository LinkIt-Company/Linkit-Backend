import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { AiClassificationPayload } from './type';

@Injectable()
export class AwsLambdaService {
  constructor(private readonly config: ConfigService) {}
  readonly client = new LambdaClient({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: this.config.get<string>('AWS_LAMBDA_ACCESS_KEY'),
      secretAccessKey: this.config.get<string>('AWS_LAMBDA_SECRET_KEY'),
    },
  });

  async invokeLambda(
    lambdaFunctionName: string,
    payload: AiClassificationPayload,
  ): Promise<void> {
    const command = new InvokeCommand({
      FunctionName: lambdaFunctionName,
      InvocationType: 'Event',
      Payload: JSON.stringify(payload),
    });
    await this.client.send(command);
  }
}
