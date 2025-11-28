import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseEntity } from './entities/course.entity';
import { ProfessorEntity } from 'src/professors/entities/professor.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { isUUID } from 'class-validator';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger('CoursesService');

  constructor(
    @InjectRepository(CourseEntity)
    private readonly coursesRepository: Repository<CourseEntity>,

    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<ProfessorEntity>,
  ) {}

  async createCourse(createCourseDto: CreateCourseDto, user: any) {
    try {
      const profesor = await this.professorsRepository.findOne({
        where: { id: createCourseDto.professorId },
        relations: ['usuario'],
      });

      if (!profesor) {
        throw new NotFoundException(
          `No existe el profesor con id ${createCourseDto.professorId}`,
        );
      }

      if (user.rol !== 'admin') {
        if (user.rol === 'profesor') {
          if (profesor.usuario.id !== user.id) {
            throw new ForbiddenException(
              'Solo puedes crear cursos donde tú seas el profesor.',
            );
          }
        }

        if (user.rol === 'estudiante') {
          throw new ForbiddenException(
            'Los estudiantes no pueden crear cursos.',
          );
        }
      }

      const newCourse = this.coursesRepository.create({
        ...createCourseDto,
        profesor,
      });

      await this.coursesRepository.save(newCourse);
      return `El curso fue creado`;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findAll(user: any) {
    try {
      if (user.rol === 'admin') {
        return await this.coursesRepository.find({
          relations: ['profesor', 'profesor.usuario'],
        });
      }

      if (user.rol === 'estudiante') {
        return await this.coursesRepository.find({
          relations: ['profesor', 'profesor.usuario'],
        });
      }

      if (user.rol === 'profesor') {
        return await this.coursesRepository
          .find({
            relations: ['profesor', 'profesor.usuario'],
          })
          .then((all) =>
            all.filter((course) => course.profesor.usuario.id === user.id),
          );
      }

      throw new ForbiddenException('Acceso denegado.');
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findOneById(
    id: string,
    user: any,
  ): Promise<CourseEntity | null | undefined> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Id ${id} no es válido`);
    }

    try {
      const course = await this.coursesRepository.findOne({
        where: { id },
        relations: ['profesor', 'profesor.usuario'],
      });

      if (!course)
        throw new NotFoundException(`Curso con id ${id} no encontrado`);

      if (user.rol === 'admin') return course;

      // Estudiante → puede ver todos
      if (user.rol === 'estudiante') return course;

      // Profesor → solo si él dicta el curso
      if (user.rol === 'profesor') {
        if (course.profesor.usuario.id !== user.id) {
          throw new ForbiddenException('No puedes ver cursos que no dictas.');
        }
        return course;
      }

      throw new ForbiddenException('Acceso denegado.');
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, user: any) {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['profesor', 'profesor.usuario'],
    });

    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    if (user.rol === 'profesor') {
      if (course.profesor.usuario.id !== user.id) {
        throw new ForbiddenException(
          'Solo puedes actualizar cursos que tú dictas.',
        );
      }
    }

    if (user.rol === 'estudiante') {
      throw new ForbiddenException(
        'Los estudiantes no pueden actualizar cursos.',
      );
    }

    const updatedCourse = await this.coursesRepository.preload({
      id,
      ...updateCourseDto,
    });

    // Si viene nuevo profesor
    if (updateCourseDto.professorId) {
      const profesor = await this.professorsRepository.findOne({
        where: { id: updateCourseDto.professorId },
        relations: ['usuario'],
      });

      if (!profesor) {
        throw new NotFoundException(
          `Profesor con id ${updateCourseDto.professorId} no existe`,
        );
      }

      updatedCourse!.profesor = profesor;
    }

    try {
      await this.coursesRepository.save(updatedCourse!);
      return updatedCourse;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async removeCourse(id: string, user: any) {
    const course = await this.findOneById(id, user);

    if (user.rol !== 'admin') {
      if (user.rol === 'profesor') {
        if (course!.profesor.usuario.id !== user.id) {
          throw new ForbiddenException(
            'Solo puedes eliminar cursos que tú dictas.',
          );
        }
      }

      if (user.rol === 'estudiante') {
        throw new ForbiddenException(
          'Los estudiantes no pueden eliminar cursos.',
        );
      }
    }
    await this.coursesRepository.remove(course!);
    return `Se eliminó el curso con id: ${id}`;
  }

  handlerErrors(error: any) {
    this.logger.error(error.message);

    if (error.code === '23505') {
      throw new BadRequestException(
        'Restricción única: este profesor ya tiene un curso con ese nombre',
      );
    }

    throw new BadRequestException(error.message);
  }
}
