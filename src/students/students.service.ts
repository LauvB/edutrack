import {
  BadRequestException,
  ForbiddenException,
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
import { ProfessorEntity } from '../professors/entities/professor.entity';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger('StudentsService');

  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<ProfessorEntity>,
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

  async findAll(currentUser: any) {
    try {
      if (currentUser.rol === 'admin') {
        return await this.studentsRepository.find({
          relations: ['usuario'],
        });
      }

      if (currentUser.rol === 'profesor') {
        const professor = await this.professorsRepository.findOne({
          where: { usuario: { id: currentUser.id } },
          relations: [
            'cursos',
            'cursos.inscripciones',
            'cursos.inscripciones.estudiante',
            'cursos.inscripciones.estudiante.usuario',
          ],
        });

        if (!professor) {
          return [];
        }

        const studentsMap = new Map<string, StudentEntity>();

        for (const curso of professor.cursos ?? []) {
          for (const ins of curso.inscripciones ?? []) {
            if (ins.estudiante) {
              studentsMap.set(ins.estudiante.id, ins.estudiante);
            }
          }
        }

        return Array.from(studentsMap.values());
      }

      throw new ForbiddenException(
        'No tiene permisos para listar estudiantes.',
      );
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findOneById(id: string, currentUser: any) {
    if (!isUUID(id)) throw new BadRequestException('El Id no es válido');

    try {
      const student = await this.studentsRepository.findOne({
        where: { id },
        relations: [
          'usuario',
          'inscripciones',
          'inscripciones.curso',
          'inscripciones.curso.profesor',
          'inscripciones.curso.profesor.usuario',
        ],
      });

      if (!student) {
        throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
      }

      if (currentUser.rol === 'admin') {
        return student;
      }

      if (currentUser.rol === 'estudiante') {
        if (student.usuario.id !== currentUser.id) {
          throw new ForbiddenException(
            'No tiene permisos para ver este estudiante.',
          );
        }
        return student;
      }

      if (currentUser.rol === 'profesor') {
        const isInProfessorCourses =
          student.inscripciones?.some(
            (ins) => ins.curso?.profesor?.usuario?.id === currentUser.id,
          ) ?? false;

        if (!isInProfessorCourses) {
          throw new ForbiddenException(
            'No tiene permisos para ver este estudiante.',
          );
        }

        return student;
      }

      throw new ForbiddenException(
        'No tiene permisos para ver este estudiante.',
      );
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async updateStudent(id: string, dto: UpdateStudentDto, currentUser: any) {
    if (!isUUID(id)) {
      throw new BadRequestException('El id no es válido');
    }
    try {
      const student = await this.studentsRepository.findOne({
        where: { id },
        relations: ['usuario'],
      });

      if (!student) {
        throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
      }

      if (currentUser.rol !== 'admin') {
        if (
          currentUser.rol === 'estudiante' &&
          student.usuario.id !== currentUser.id
        ) {
          throw new ForbiddenException(
            'No tiene permisos para actualizar este estudiante.',
          );
        }

        if (currentUser.rol === 'profesor') {
          throw new ForbiddenException(
            'Los profesores no pueden actualizar perfiles de estudiantes.',
          );
        }
      }

      const studentToUpdate = await this.studentsRepository.preload({
        id,
        ...dto,
      });

      if (!studentToUpdate) {
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

        studentToUpdate.usuario = newUser;
      }

      await this.studentsRepository.save(studentToUpdate);
      return studentToUpdate;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async removeStudent(id: string, currentUser: any) {
    if (!isUUID(id)) {
      throw new BadRequestException('El id no es válido');
    }

    try {
      const student = await this.studentsRepository.findOne({
        where: { id },
        relations: ['usuario'],
      });

      if (!student) {
        throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
      }

      if (currentUser.rol !== 'admin') {
        if (
          currentUser.rol === 'estudiante' &&
          student.usuario.id !== currentUser.id
        ) {
          throw new ForbiddenException(
            'No tiene permisos para eliminar este estudiante.',
          );
        }

        if (currentUser.rol === 'profesor') {
          throw new ForbiddenException(
            'Los profesores no pueden eliminar perfiles de estudiantes.',
          );
        }
      }

      await this.studentsRepository.remove(student);
      return `Estudiante con id ${id} eliminado correctamente.`;
    } catch (error) {
      this.handleErrors(error);
    }
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
