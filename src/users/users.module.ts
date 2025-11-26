import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { ProfessorEntity } from 'src/professors/entities/professor.entity';
import { StudentEntity } from 'src/students/entities/student.entity';
import { UserFactoryService } from './factories/user-factory.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserFactoryService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, ProfessorEntity, StudentEntity]),
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
