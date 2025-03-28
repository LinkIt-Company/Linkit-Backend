import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export const dbConfig: any = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNC,
  logging: process.env.DB_LOGGING,
  migrations: ['**/migrations/*.ts'],
};

export const AppDataSource = new DataSource(dbConfig);
