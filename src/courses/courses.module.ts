import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseEntity } from './entities/course.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorEntity } from 'src/professors/entities/professor.entity';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CourseEntity, ProfessorEntity]),
  ],
  exports: [CoursesService, TypeOrmModule],
})
export class CoursesModule {}
