import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [ConfigModule, TypeOrmModule.forFeature([StudentEntity])],
  exports: [StudentsService, TypeOrmModule],
})
export class StudentsModule {}
