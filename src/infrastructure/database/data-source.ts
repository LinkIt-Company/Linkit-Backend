import dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

dotenv.config();

const migrationsGlob = join(__dirname, 'migrations/*{.ts,.js}');

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
  migrations: [migrationsGlob],
};

export const AppDataSource = new DataSource(dbConfig);
