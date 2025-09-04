import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpworkService } from './upwork.service';
import { UpworkController } from './upwork.controller';
import { ApiKey } from '../entities/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [UpworkService],
  controllers: [UpworkController],
  exports: [UpworkService],
})
export class UpworkModule {}
