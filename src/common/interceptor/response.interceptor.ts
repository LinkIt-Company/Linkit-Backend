import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ICommonResponse } from '../types/type';

export class CommonResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((payload = {}): ICommonResponse => {
        return {
          success: true,
          data: payload,
        };
      }),
    );
  }
}
