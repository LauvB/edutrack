import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfessorEntity } from '../professors/entities/professor.entity';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([StudentEntity, UserEntity, ProfessorEntity]),
  ],
  exports: [StudentsService, TypeOrmModule],
})
export class StudentsModule {}
