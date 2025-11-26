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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'estudiante')
  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.createEnrollment(dto);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.findOneById(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.updateEnrollment(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'estudiante')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.removeEnrollment(id);
  }
}
