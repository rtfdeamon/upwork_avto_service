import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpworkAuthService } from './upwork-auth.service';
import { UpworkAuthController } from './upwork-auth.controller';
import { ApiKey } from '../entities/api-key.entity';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), TypeOrmModule.forFeature([ApiKey])],
  providers: [UpworkAuthService],
  controllers: [UpworkAuthController],
  exports: [UpworkAuthService],
})
export class UpworkAuthModule {}
