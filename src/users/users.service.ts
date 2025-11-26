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
import { UserFactoryService } from './factories/user-factory.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ProfessorEntity } from 'src/professors/entities/professor.entity';
import { StudentEntity } from 'src/students/entities/student.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    private readonly userFactoryService: UserFactoryService,

    private readonly configService: ConfigService,

    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<ProfessorEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.contraseña);

      const newUser = this.usersRepository.create({
        ...createUserDto,
        contraseña: hashedPassword,
      });
      const saved = await this.usersRepository.save(newUser);

      //Crear Student o Professor automáticamente
      await this.userFactoryService.handleUserCreation(saved);

      return `El usuario fue guardado`;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findAll() {
    try {
      const users: UserEntity[] = await this.usersRepository.find();

      const usersWithProfiles = await Promise.all(
        users.map(async (user) => {
          const perfil = await this.getUserProfile(user.id!);

          return {
            ...user,
            perfil,
          };
        }),
      );

      return { users: usersWithProfiles };
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findOneById(id: string) {
    if (!isUUID(id))
      throw new BadRequestException(
        `El termino de busqueda ingresado no es un id valido`,
      );
    try {
      const user = await this.usersRepository.findOneBy({ id });

      if (!user)
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);

      const perfil = await this.getUserProfile(id);

      return {
        ...user,
        perfil,
      };
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.contraseña) {
      updateUserDto.contraseña = await this.hashPassword(
        updateUserDto.contraseña,
      );
    }

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

  /**
   * Lógica de borrado:
   * 1. Si es profesor y tiene cursos -> NO se elimina (error).
   * 2. Si es profesor sin cursos -> se elimina (perfil + user).
   * 3. Si es estudiante (con o sin inscripciones) -> se elimina en cascada y se retorna mensaje de baja.
   */
  async removeUser(id: string) {
    const user = await this.findOneById(id);

    const professor = await this.professorsRepository.findOne({
      where: { usuario: { id } },
      relations: ['cursos'],
    });

    const student = await this.studentsRepository.findOne({
      where: { usuario: { id } },
    });

    if (professor && professor.cursos && professor.cursos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el usuario porque dicta cursos. ' +
          'Reasigne o elimine los cursos antes de eliminar el usuario.',
      );
    }

    let message = `Se ha eliminado el usuario con id: ${id}`;

    if (student) {
      message = 'Estudiante dado de baja correctamente.';
    }

    try {
      await this.usersRepository.remove(user!);
      return message;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findByEmail(correo: string) {
    return await this.usersRepository.findOne({
      where: { correo },
      select: ['id', 'correo', 'contraseña', 'rol', 'nombreCompleto'],
    });
  }

  private async getUserProfile(userId: string) {
    // Revisar si es profesor
    const professor = await this.professorsRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['cursos'],
    });

    if (professor) {
      return {
        tipo: 'profesor',
        id: professor.id,
        especialidad: professor.especialidad,
        cursos: professor.cursos,
      };
    }

    // Revisar si es estudiante
    const student = await this.studentsRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['inscripciones'],
    });

    if (student) {
      return {
        tipo: 'estudiante',
        id: student.id,
        anioIngreso: student.anioIngreso,
        inscripciones: student.inscripciones,
      };
    }

    // Sin perfil
    return null;
  }

  handlerErrors(error: any) {
    this.logger.error(error.message);

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar el usuario porque tiene entidades asociadas. ' +
          'Verifique cursos, perfiles o inscripciones antes de eliminar.',
      );
    }

    if (error.code === '23505') {
      throw new BadRequestException(
        'Violación de restricción única (correo o perfil).',
      );
    }

    throw new BadRequestException(error.message);
  }

  private async hashPassword(rawPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(
      Number(this.configService.get('SALT_ROUNDS')),
    );
    return bcrypt.hash(rawPassword, salt);
  }
}
