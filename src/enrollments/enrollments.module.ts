import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  imports: [ConfigModule, TypeOrmModule.forFeature([EnrollmentEntity])],
  exports: [EnrollmentsService, TypeOrmModule],
})
export class EnrollmentsModule {}
