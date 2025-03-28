import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  CommonResponseInterceptor,
  RootExceptionFilter,
  createErrorObject,
} from './common';
import { DiscordErrorWebhookProvider } from './infrastructure/discord/discord-error-webhook.provider';

export async function nestAppConfig<
  T extends INestApplication = INestApplication,
>(app: T) {
  const reflector = app.get<Reflector>(Reflector);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (error) => {
        const validationErrorObject = error[0];
        // Validation Error Property
        const targetProperty = validationErrorObject.property;
        // Validation Error Description
        const validationErrorDetail =
          validationErrorObject.constraints[
            Object.keys(validationErrorObject.constraints)[0]
          ];
        const errorMessage = `'${targetProperty}' 필드의 검증 오류가 발생했습니다: ${validationErrorDetail}`;
        return new BadRequestException(createErrorObject('V000', errorMessage));
      },
      stopAtFirstError: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
}

export function nestResponseConfig<
  T extends INestApplication = INestApplication,
>(app: T, connectSentry = false) {
  app.useGlobalInterceptors(new CommonResponseInterceptor());
  connectSentry
    ? configExceptionFilterWithSentry(app)
    : configFilterStandAlone(app);
}

// Enable Exception Filter stand-alone
function configFilterStandAlone<T extends INestApplication = INestApplication>(
  app: T,
) {
  app.useGlobalFilters(
    new RootExceptionFilter(
      new DiscordErrorWebhookProvider(new ConfigService()),
    ),
  );
}

// Enalbe Exception Filter with Sentry Connection
function configExceptionFilterWithSentry<
  T extends INestApplication = INestApplication,
>(app: T) {
  // const config = app.get<ConfigService>(ConfigService);
  // Sentry.init({
  //   dsn: config.get<string>('SENTRY_DSN'),
  //   integrations: [nodeProfilingIntegration()],
  //   tracesSampleRate: 1.0,
  //   profilesSampleRate: 1.0,
  // });
  // Sentry.setupNestErrorHandler(app, new RootExceptionFilter());
}
