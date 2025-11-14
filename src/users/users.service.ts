import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    return `El usuario fue guardado`;
  }

  async findAll() {
    try {
      const users: UserEntity[] = await this.usersRepository.find();
      return { users };
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findOneById(id: string): Promise<UserEntity | null | undefined> {
    if (!isUUID(id))
      throw new BadRequestException(
        `El termino de busqueda ingresado no es un id valido`,
      );
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user)
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      return user;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async removeUser(id: string) {
    const user = await this.findOneById(id);
    await this.usersRepository.remove(user!);
    return `Se ha elminado el usuario con id: ${id}`;
  }

  handlerErrors(error: any) {
    this.logger.error(error.message);
    throw new BadRequestException(error.message);
  }
}
