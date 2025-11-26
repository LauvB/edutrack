import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from './entities/student.entity';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger('StudentsService');

  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createStudent(dto: CreateStudentDto) {
    try {
      const user = await this.usersRepository.findOneBy({ id: dto.userId });

      if (!user) throw new NotFoundException('El usuario no existe');

      if (user.rol !== 'estudiante') {
        throw new BadRequestException(
          'Solo un usuario con rol estudiante puede tener un perfil de estudiante',
        );
      }

      const existingProfile = await this.studentsRepository.findOne({
        where: { usuario: { id: dto.userId } },
      });

      if (existingProfile) {
        throw new BadRequestException(
          'Este usuario ya tiene un perfil de estudiante. Use PATCH para actualizar.',
        );
      }

      const student = this.studentsRepository.create({
        anioIngreso: dto.anioIngreso,
        usuario: user,
      });

      await this.studentsRepository.save(student);
      return 'Perfil de estudiante creado correctamente';
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findAll() {
    try {
      const students: StudentEntity[] = await this.studentsRepository.find();
      return { students };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findOneById(id: string) {
    if (!isUUID(id)) throw new BadRequestException('El Id no es válido');

    try {
      const student = await this.studentsRepository.findOneBy({ id });

      if (!student)
        throw new NotFoundException(`Estudiante con id ${id} no encontrado`);

      return student;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async updateStudent(id: string, dto: UpdateStudentDto) {
    try {
      const student = await this.studentsRepository.preload({
        id,
        ...dto,
      });

      if (!student) {
        throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
      }

      if (dto.userId) {
        const newUser = await this.usersRepository.findOneBy({
          id: dto.userId,
        });

        if (!newUser) {
          throw new NotFoundException(
            `Usuario con id ${dto.userId} no encontrado`,
          );
        }

        if (newUser.rol !== 'estudiante') {
          throw new BadRequestException(
            'Solo un usuario con rol estudiante puede ser asignado como estudiante',
          );
        }

        const existing = await this.studentsRepository.findOne({
          where: { usuario: { id: dto.userId } },
        });

        if (existing && existing.id !== id) {
          throw new BadRequestException(
            'Este usuario ya tiene un perfil de estudiante',
          );
        }

        student.usuario = newUser;
      }

      await this.studentsRepository.save(student);
      return student;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async removeStudent(id: string) {
    const student = await this.findOneById(id);

    await this.studentsRepository.remove(student);

    return `Estudiante con id ${id} eliminado correctamente`;
  }

  private handleErrors(error: any): never {
    this.logger.error(error.message);

    if (error.code === '23505') {
      throw new BadRequestException(
        'Violación de restricción única: ya existe un perfil para este usuario',
      );
    }

    throw new BadRequestException(error.message);
  }
}
