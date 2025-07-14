import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'upwork',
  password: process.env.DB_PASS || 'upwork',
  database: process.env.DB_NAME || 'upwork',
  entities: [User, ApiKey],
  migrations: ['src/migrations/*.ts'],
});
