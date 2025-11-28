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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('courses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles('profesor', 'admin')
  @Post()
  createCourse(@Body() dto: CreateCourseDto, @GetUser() user: any) {
    return this.coursesService.createCourse(dto, user);
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Get('getAllCourses')
  findAll(@GetUser() user: any) {
    return this.coursesService.findAll(user);
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any) {
    return this.coursesService.findOneById(id, user);
  }

  @Roles('profesor', 'admin')
  @Patch(':id')
  updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
    @GetUser() user: any,
  ) {
    return this.coursesService.updateCourse(id, dto, user);
  }

  @Roles('profesor', 'admin')
  @Delete(':id')
  removeCourse(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any) {
    return this.coursesService.removeCourse(id, user);
  }
}
