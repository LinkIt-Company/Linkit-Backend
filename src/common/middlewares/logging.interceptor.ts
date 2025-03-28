import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;

    const start = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const end = Date.now();
      const duration = end - start;
      const userId = request.user ? request.user['id'] : '-';

      const logMessage = [
        `${method} ${originalUrl} ${statusCode} ${ip} - ${duration}ms`,
        `User Id : ${userId}`,
        `Query ${JSON.stringify(request.query)}`,
        `Body ${JSON.stringify(request.body)}`,
      ].join('\n');
      this.logger.log(logMessage);
    });

    next();
  }
}
