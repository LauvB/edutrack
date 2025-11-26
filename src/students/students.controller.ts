import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOneById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.updateStudent(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  removeStudent(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.removeStudent(id);
  }
}
