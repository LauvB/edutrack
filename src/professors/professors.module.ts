import { Module } from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { ProfessorsController } from './professors.controller';
import { ProfessorEntity } from './entities/professor.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  controllers: [ProfessorsController],
  providers: [ProfessorsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ProfessorEntity, UserEntity]),
    UsersModule,
    CoursesModule,
  ],
  exports: [ProfessorsService, TypeOrmModule],
})
export class ProfessorsModule {}
