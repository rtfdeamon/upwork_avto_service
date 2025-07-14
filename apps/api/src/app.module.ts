import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { MeController } from './controllers/me.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'upwork',
      password: process.env.DB_PASS || 'upwork',
      database: process.env.DB_NAME || 'upwork',
      entities: [User, ApiKey],
      synchronize: false,
    }),
    AuthModule,
    ApiKeysModule,
  ],
  controllers: [MeController],
})
export class AppModule {}
