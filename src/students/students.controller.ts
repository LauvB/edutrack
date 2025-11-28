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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('admin')
  @Post()
  createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  @Roles('admin', 'profesor')
  @Get()
  findAll(@GetUser() currentUser: any) {
    return this.studentsService.findAll(currentUser);
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() currentUser: any) {
    return this.studentsService.findOneById(id, currentUser);
  }

  @Roles('admin', 'estudiante')
  @Patch(':id')
  updateStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
    @GetUser() currentUser: any,
  ) {
    return this.studentsService.updateStudent(id, dto, currentUser);
  }

  @Roles('admin', 'estudiante')
  @Delete(':id')
  removeStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser: any,
  ) {
    return this.studentsService.removeStudent(id, currentUser);
  }
}
