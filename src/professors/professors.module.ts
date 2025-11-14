import { Module } from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { ProfessorsController } from './professors.controller';
import { ProfessorEntity } from './entities/professor.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ProfessorsController],
  providers: [ProfessorsService],
  imports: [ConfigModule, TypeOrmModule.forFeature([ProfessorEntity])],
  exports: [ProfessorsService, TypeOrmModule],
})
export class ProfessorsModule {}
