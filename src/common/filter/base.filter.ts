import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { captureException } from '@sentry/node';
import { Response } from 'express';
import { DiscordErrorWebhookProvider } from '@src/infrastructure/discord/discord-error-webhook.provider';
import { RootException, createException } from '../error';
import { ExceptionPayload, ICommonResponse } from '../types/type';

@Catch()
export class RootExceptionFilter implements ExceptionFilter {
  private unknownCode = 'Unknown';

  constructor(
    private readonly discordErrorWebhookProvider: DiscordErrorWebhookProvider,
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response: Response = context.getResponse<Response>();
    console.log(exception);

    let targetException = exception;
    let responseStatusCode = 500;
    let responseErrorPayload: ExceptionPayload = {
      code: this.unknownCode,
      message: '',
    };

    // If exception is http exception instance
    if (targetException instanceof HttpException) {
      // Response Message
      const response = targetException.getResponse();
      // Response Status Code
      responseStatusCode = targetException.getStatus();
      responseErrorPayload = response as ExceptionPayload;
    }
    // Custom Exception
    else if (targetException instanceof RootException) {
      // Response Message
      const response = targetException.payload;
      // Response Status Code
      const statusCode = targetException.statuscode;
      responseErrorPayload = response;
      responseStatusCode = statusCode;
    }
    // Error
    else {
      const errorMessage = targetException.message;
      // Response Status Code
      responseStatusCode = 500;
      // Response Message
      responseErrorPayload = {
        code: this.unknownCode,
        message: errorMessage,
      };
      targetException = new (class extends createException(
        responseStatusCode,
        errorMessage ?? exception.name,
        this.unknownCode,
      ) {})();
    }
    captureException(targetException);
    const exceptionResponse: ICommonResponse = {
      success: false,
      error: responseErrorPayload,
    };

    if (responseStatusCode >= 500) {
      await this.handle(request, exception);
    }

    return response.status(responseStatusCode).json(exceptionResponse);
  }

  private async handle(request: Request, error: Error) {
    const content = this.parseError(request, error);
    await this.discordErrorWebhookProvider.send(content);
  }

  private parseError(request: Request, error: Error): string {
    return `노드팀 채찍 맞아라~~ 🦹🏿‍♀️👹🦹🏿
에러 발생 API : ${request.method} ${request.url}

에러 메세지 : ${error.message}

에러 위치 : ${error.stack
      .split('\n')
      .slice(0, 2)
      .map((message) => message.trim())
      .join('\n')}

당장 고쳐서 올렷!
    `;
  }
}
