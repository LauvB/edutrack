import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Roles('admin')
  @Get('getAllUsers')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Get(':id')
  getUserBy(@Param('id') id: string, @GetUser() currentUser: any) {
    return this.usersService.findOneById(id, currentUser);
  }

  @Roles('admin', 'profesor', 'estudiante')
  @Patch(':id')
  updateUser(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body()
    updateUserDto: UpdateUserDto,
    @GetUser() currentUser: any,
  ) {
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  @Roles('admin')
  @Delete(':id')
  removeUser(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.usersService.removeUser(id);
  }
}
