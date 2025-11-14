import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('getAllUsers')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getUserBy(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  removeUser(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.usersService.removeUser(id);
  }
}
