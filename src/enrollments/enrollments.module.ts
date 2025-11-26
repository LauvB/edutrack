import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from 'src/students/entities/student.entity';
import { CourseEntity } from 'src/courses/entities/course.entity';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([EnrollmentEntity, StudentEntity, CourseEntity]),
  ],
  exports: [EnrollmentsService, TypeOrmModule],
})
export class EnrollmentsModule {}
