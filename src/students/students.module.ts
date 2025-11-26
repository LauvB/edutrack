import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([StudentEntity, UserEntity]),
  ],
  exports: [StudentsService, TypeOrmModule],
})
export class StudentsModule {}
