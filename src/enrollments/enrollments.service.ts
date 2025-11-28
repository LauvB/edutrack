import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from 'src/courses/entities/course.entity';
import { StudentEntity } from 'src/students/entities/student.entity';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { isUUID } from 'class-validator';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger('EnrollmentsService');

  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentsRepository: Repository<EnrollmentEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,

    @InjectRepository(CourseEntity)
    private readonly coursesRepository: Repository<CourseEntity>,
  ) {}

  async createEnrollment(dto: CreateEnrollmentDto, currentUser: any) {
    try {
      const student = await this.studentsRepository.findOne({
        where: { id: dto.studentId },
        relations: ['usuario'],
      });

      if (!student)
        throw new NotFoundException(
          `No existe el estudiante con id ${dto.studentId}`,
        );

      const course = await this.coursesRepository.findOne({
        where: { id: dto.courseId },
        relations: ['profesor', 'profesor.usuario'],
      });

      if (!course)
        throw new NotFoundException(
          `No existe el curso con id ${dto.courseId}`,
        );

      if (currentUser.rol !== 'admin') {
        if (currentUser.rol === 'estudiante') {
          if (student.usuario.id !== currentUser.id) {
            throw new ForbiddenException(
              'Solo puedes crear inscripciones para ti mismo.',
            );
          }
        }

        if (currentUser.rol === 'profesor') {
          throw new ForbiddenException(
            'Los profesores no pueden crear inscripciones.',
          );
        }
      }

      const fecha = new Date(dto.fechaInscripcion);
      if (isNaN(fecha.getTime())) {
        throw new BadRequestException(
          'La fecha de inscripción es inválida (use YYYY-MM-DD).',
        );
      }

      // Validación: No duplicar estudiante+curso
      const existing = await this.enrollmentsRepository.findOne({
        where: {
          estudiante: { id: dto.studentId },
          curso: { id: dto.courseId },
        },
      });

      if (existing) {
        throw new BadRequestException(
          'El estudiante ya está inscrito en este curso',
        );
      }

      const enrollment = this.enrollmentsRepository.create({
        fechaInscripcion: fecha,
        nota: dto.nota,
        estudiante: student,
        curso: course,
      });

      await this.enrollmentsRepository.save(enrollment);
      return `Inscripción creada exitosamente`;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findAll(currentUser: any) {
    try {
      if (currentUser.rol === 'admin') {
        return await this.enrollmentsRepository.find({
          relations: [
            'estudiante',
            'estudiante.usuario',
            'curso',
            'curso.profesor',
            'curso.profesor.usuario',
          ],
        });
      }

      if (currentUser.rol === 'estudiante') {
        return await this.enrollmentsRepository.find({
          where: { estudiante: { usuario: { id: currentUser.id } } },
          relations: ['estudiante', 'curso'],
        });
      }

      if (currentUser.rol === 'profesor') {
        return await this.enrollmentsRepository
          .find({
            relations: [
              'estudiante',
              'estudiante.usuario',
              'curso',
              'curso.profesor',
              'curso.profesor.usuario',
            ],
          })
          .then((all) =>
            all.filter(
              (ins) => ins.curso.profesor.usuario.id === currentUser.id,
            ),
          );
      }

      throw new ForbiddenException(
        'No tienes permisos para ver inscripciones.',
      );
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findOneById(id: string, currentUser: any) {
    if (!isUUID(id)) {
      throw new BadRequestException('El id no es válido');
    }

    try {
      const enrollment = await this.enrollmentsRepository.findOne({
        where: { id },
        relations: [
          'estudiante',
          'estudiante.usuario',
          'curso',
          'curso.profesor',
          'curso.profesor.usuario',
        ],
      });

      if (!enrollment) {
        throw new NotFoundException('Inscripción no encontrada.');
      }

      if (currentUser.rol === 'admin') return enrollment;

      if (currentUser.rol === 'estudiante') {
        if (enrollment.estudiante.usuario.id !== currentUser.id) {
          throw new ForbiddenException(
            'Solo puedes ver tus propias inscripciones.',
          );
        }
        return enrollment;
      }

      if (currentUser.rol === 'profesor') {
        if (enrollment.curso.profesor.usuario.id !== currentUser.id) {
          throw new ForbiddenException(
            'No puedes ver inscripciones de cursos que no dictas.',
          );
        }
        return enrollment;
      }

      throw new ForbiddenException('Acceso denegado.');
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async updateEnrollment(
    id: string,
    dto: UpdateEnrollmentDto,
    currentUser: any,
  ) {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: [
        'estudiante',
        'estudiante.usuario',
        'curso',
        'curso.profesor',
        'curso.profesor.usuario',
      ],
    });

    if (!enrollment) {
      throw new NotFoundException(`Inscripción con id ${id} no encontrada`);
    }

    if (currentUser.rol === 'estudiante') {
      throw new ForbiddenException(
        'Los estudiantes no pueden actualizar inscripciones.',
      );
    }

    if (currentUser.rol === 'profesor') {
      if (
        !enrollment.curso.profesor ||
        enrollment.curso.profesor.usuario.id !== currentUser.id
      ) {
        throw new ForbiddenException(
          'Sólo puedes actualizar inscripciones de cursos que dictas.',
        );
      }
    }

    const enrollmentToUpdate = await this.enrollmentsRepository.preload({
      id,
      ...dto,
      fechaInscripcion: dto.fechaInscripcion
        ? new Date(dto.fechaInscripcion + 'T00:00:00')
        : undefined,
    });

    if (!enrollmentToUpdate) {
      throw new NotFoundException(`Inscripción con id ${id} no encontrada`);
    }

    if (dto.studentId) {
      const student = await this.studentsRepository.findOneBy({
        id: dto.studentId,
      });
      if (!student) {
        throw new NotFoundException(
          `No existe el estudiante con id ${dto.studentId}`,
        );
      }
      enrollmentToUpdate.estudiante = student;
    }

    if (dto.courseId) {
      const course = await this.coursesRepository.findOne({
        where: { id: dto.courseId },
        relations: ['profesor', 'profesor.usuario'],
      });
      if (!course) {
        throw new NotFoundException(
          `No existe el curso con id ${dto.courseId}`,
        );
      }
      enrollmentToUpdate.curso = course;
    }

    try {
      const saved = await this.enrollmentsRepository.save(enrollmentToUpdate);

      return {
        ...saved,
        fechaInscripcion: saved.fechaInscripcion?.toISOString().split('T')[0],
      };
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async removeEnrollment(id: string, currentUser: any) {
    const enrollment = await this.findOneById(id, currentUser);

    if (currentUser.rol !== 'admin') {
      // Profesor → nunca elimina
      if (currentUser.rol === 'profesor') {
        throw new ForbiddenException(
          'Los profesores no pueden eliminar inscripciones.',
        );
      }

      // Estudiante → solo su propia inscripción
      if (enrollment!.estudiante.usuario.id !== currentUser.id) {
        throw new ForbiddenException(
          'Solo puedes eliminar tus propias inscripciones.',
        );
      }
    }

    await this.enrollmentsRepository.remove(enrollment!);
    return `Se eliminó la inscripción con id: ${id}`;
  }

  handlerErrors(error: any) {
    this.logger.error(error.message);

    if (error.code === '23505') {
      throw new BadRequestException(
        'El estudiante ya está inscrito en este curso',
      );
    }

    throw new BadRequestException(error.message);
  }
}
