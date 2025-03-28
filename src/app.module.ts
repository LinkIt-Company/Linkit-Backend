// Nest Packages
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// Custom Packages
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@src/infrastructure';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middlewares';
import { AiModule } from './infrastructure/ai/ai.module';
import { AwsLambdaModule } from './infrastructure/aws-lambda/aws-lambda.module';
import { DiscordModule } from './infrastructure/discord/discord.module';
import { PuppeteerPoolModule } from './infrastructure/puppeteer-pool/puppeteer-pool.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { FoldersModule } from './modules/folders/folders.module';
import { LaunchingEventsModule } from './modules/launching-events/launching-events.module';
import { LinksModule } from './modules/links/links.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { OnboardModule } from './modules/onboard/onboard.module';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    DatabaseModule,
    DiscordModule,
    AiModule,
    UsersModule,
    ClassificationModule,
    AuthModule,
    FoldersModule,
    LinksModule,
    PostsModule,
    AwsLambdaModule,
    OnboardModule,
    MetricsModule,
    LaunchingEventsModule,
    PuppeteerPoolModule,
    // PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('/*');
  }
}
