import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { nestAppConfig, nestResponseConfig } from './app.config';
import { AppModule } from './app.module';
import { nestSwaggerConfig } from './app.swagger';

export async function bootstrap() {
  const expressInstance: express.Express = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    { cors: true },
  );

  // Config Nest.js Application
  nestAppConfig(app);
  // Config application Swagger
  nestSwaggerConfig(app);
  // Config Response
  nestResponseConfig(app, false);

  return { app, expressInstance };
}

export async function runServer() {
  const { app } = await bootstrap();
  await app.listen(3000);
  return app;
}
