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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesor', 'admin')
  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  @Get('getAllCourses')
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOneById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesor', 'admin')
  @Patch(':id')
  updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('profesor', 'admin')
  @Delete(':id')
  removeCourse(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeCourse(id);
  }
}
