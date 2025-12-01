import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS, { ResourceWithOptions } from 'adminjs';
import express, { Express } from 'express';
import { DataSource, BaseEntity as TypeOrmBaseEntity } from 'typeorm';
import { AIClassification } from '@src/infrastructure/database/entities/ai-classification.entity';
import { Folder } from '@src/infrastructure/database/entities/folder.entity';
import { Keyword } from '@src/infrastructure/database/entities/keyword.entity';
import { Metrics } from '@src/infrastructure/database/entities/metrics.entity';
import { OnboardCategory } from '@src/infrastructure/database/entities/onboard-category.entity';
import { PostKeyword } from '@src/infrastructure/database/entities/post-keyword.entity';
import { Post } from '@src/infrastructure/database/entities/post.entity';
import { User } from '@src/infrastructure/database/entities/user.entity';

type AdminEntityConfig = {
  entity: typeof TypeOrmBaseEntity;
  navigation: {
    name: string;
    icon: string;
  };
};

const adminEntityConfigs: AdminEntityConfig[] = [
  {
    entity: User,
    navigation: { name: 'Users', icon: 'User' },
  },
  {
    entity: Post,
    navigation: { name: 'Content', icon: 'DocumentText' },
  },
  {
    entity: Folder,
    navigation: { name: 'Content', icon: 'DocumentText' },
  },
  {
    entity: AIClassification,
    navigation: { name: 'AI', icon: 'Bot' },
  },
  {
    entity: Keyword,
    navigation: { name: 'Content', icon: 'DocumentText' },
  },
  {
    entity: PostKeyword,
    navigation: { name: 'Content', icon: 'DocumentText' },
  },
  {
    entity: Metrics,
    navigation: { name: 'Analytics', icon: 'Activity' },
  },
  {
    entity: OnboardCategory,
    navigation: { name: 'Onboarding', icon: 'Idea' },
  },
];

@Module({})
export class AdminJSModule implements OnModuleInit, NestModule {
  constructor(
    @Inject(HttpAdapterHost) private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(getDataSourceToken()) private readonly dataSource: DataSource,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // AdminJS middleware will be configured in onModuleInit
  }

  async onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app = httpAdapter.getInstance() as Express;

    try {
      // Register TypeORM adapter (AdminJS v6 is CommonJS compatible)
      AdminJS.registerAdapter({
        Resource: AdminJSTypeorm.Resource,
        Database: AdminJSTypeorm.Database,
      });

      const DEFAULT_ADMIN = {
        email:
          this.configService.get<string>('ADMIN_EMAIL') || 'admin@linkit.com',
        password:
          this.configService.get<string>('ADMIN_PASSWORD') || 'admin123',
      };

      const authenticate = async (email: string, password: string) => {
        if (
          email === DEFAULT_ADMIN.email &&
          password === DEFAULT_ADMIN.password
        ) {
          return Promise.resolve(DEFAULT_ADMIN);
        }
        return null;
      };

      // Ensure AdminJS resources use the Nest-managed TypeORM DataSource
      adminEntityConfigs.forEach(({ entity }) =>
        entity.useDataSource?.(this.dataSource),
      );

      const resources: ResourceWithOptions[] = adminEntityConfigs.map(
        ({ entity, navigation }) => ({
          resource: entity,
          options: { navigation },
        }),
      );

      // Create AdminJS instance
      const adminJs = new AdminJS({
        rootPath: '/admin',
        resources,
        branding: {
          companyName: 'LinkIt Admin',
          logo: false,
        },
      });

      // Router Config
      const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
          authenticate,
          cookieName: 'adminjs',
          cookiePassword:
            this.configService.get<string>('ADMIN_COOKIE_SECRET') ||
            'secret-session-cookie',
        },
        null,
        {
          resave: true,
          saveUninitialized: true,
          secret:
            this.configService.get<string>('ADMIN_SESSION_SECRET') ||
            'secret-session-key',
        },
      );

      // Use the router in Express app
      app.use(adminJs.options.rootPath, adminRouter);

      console.log(
        `[AdminJS] Admin panel is running at ${adminJs.options.rootPath}`,
      );
    } catch (error: any) {
      console.error(
        '[AdminJS] Failed to initialize AdminJS:',
        error?.message || error,
      );
      console.log('[AdminJS] Server will continue without admin panel');
    } finally {
      this.registerBodyParsers(app);
    }
  }

  private registerBodyParsers(app: Express) {
    if ((app as any)._adminBodyParserConfigured) {
      return;
    }
    (app as any)._adminBodyParserConfigured = true;
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}
