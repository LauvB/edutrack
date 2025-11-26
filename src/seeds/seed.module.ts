import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { ProfessorEntity } from '../professors/entities/professor.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { CourseEntity } from '../courses/entities/course.entity';

import { AdminSeeder } from './seed-data/admin.seeder';
import { ProfessorsSeeder } from './seed-data/professors.seeder';
import { StudentsSeeder } from './seed-data/students.seeder';

import { SeedService } from './seed.service';
import { CoursesSeeder } from './seed-data/courses.seeder';
import { EnrollmentsSeeder } from './seed-data/enrollments.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: __dirname + '/../../.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    TypeOrmModule.forFeature([
      UserEntity,
      ProfessorEntity,
      StudentEntity,
      EnrollmentEntity,
      CourseEntity,
    ]),
  ],
  providers: [
    SeedService,
    AdminSeeder,
    ProfessorsSeeder,
    StudentsSeeder,
    CoursesSeeder,
    EnrollmentsSeeder,
  ],
  exports: [SeedService],
})
export class SeedersModule {}
