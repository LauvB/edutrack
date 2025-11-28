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
import { ProfessorsService } from './professors.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('professors')
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  createProfessor(@Body() dto: CreateProfessorDto) {
    return this.professorsService.createProfessor(dto);
  }

  @Get()
  findAll() {
    return this.professorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.professorsService.findOneById(id);
  }

  @Get('byUser/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.professorsService.findByUserId(userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'profesor')
  @Patch(':id')
  updateProfessor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfessorDto,
    @GetUser() currentUser: any,
  ) {
    return this.professorsService.updateProfessor(id, dto, currentUser);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'profesor')
  @Delete(':id')
  removeProfessor(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser: any,
  ) {
    return this.professorsService.removeProfessor(id, currentUser);
  }
}
