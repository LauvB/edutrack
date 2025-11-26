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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('getAllUsers')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  removeUser(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.usersService.removeUser(id);
  }
}
