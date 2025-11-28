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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('enrollments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles('admin', 'estudiante')
  @Post()
  create(@Body() dto: CreateEnrollmentDto, @GetUser() currentUser: any) {
    return this.enrollmentsService.createEnrollment(dto, currentUser);
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Get()
  findAll(@GetUser() currentUser: any) {
    return this.enrollmentsService.findAll(currentUser);
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() currentUser: any) {
    return this.enrollmentsService.findOneById(id, currentUser);
  }

  @Roles('admin', 'profesor')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentDto,
    @GetUser() currentUser: any,
  ) {
    return this.enrollmentsService.updateEnrollment(id, dto, currentUser);
  }

  @Roles('admin', 'estudiante')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() currentUser: any) {
    return this.enrollmentsService.removeEnrollment(id, currentUser);
  }
}
