import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseEntity } from './entities/course.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [ConfigModule, TypeOrmModule.forFeature([CourseEntity])],
  exports: [CoursesService, TypeOrmModule],
})
export class CoursesModule {}
