import {
  BadRequestException,
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

  async createEnrollment(dto: CreateEnrollmentDto) {
    try {
      const student = await this.studentsRepository.findOneBy({
        id: dto.studentId,
      });

      if (!student)
        throw new NotFoundException(
          `No existe el estudiante con id ${dto.studentId}`,
        );

      const course = await this.coursesRepository.findOneBy({
        id: dto.courseId,
      });

      if (!course)
        throw new NotFoundException(
          `No existe el curso con id ${dto.courseId}`,
        );

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

  async findAll() {
    try {
      const enrollments: EnrollmentEntity[] =
        await this.enrollmentsRepository.find();
      return { enrollments };
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findOneById(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('El id no es válido');
    }

    try {
      const enrollment = await this.enrollmentsRepository.findOneBy({ id });

      if (!enrollment)
        throw new NotFoundException(`Inscripción con id ${id} no encontrada`);

      return enrollment;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async updateEnrollment(id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.enrollmentsRepository.preload({
      id,
      ...dto,
      fechaInscripcion: dto.fechaInscripcion
        ? new Date(dto.fechaInscripcion)
        : undefined,
    });

    if (!enrollment) {
      throw new NotFoundException(`Inscripción con id ${id} no encontrada`);
    }

    // Cambiar estudiante
    if (dto.studentId) {
      const student = await this.studentsRepository.findOneBy({
        id: dto.studentId,
      });
      if (!student)
        throw new NotFoundException(
          `No existe el estudiante con id ${dto.studentId}`,
        );
      enrollment.estudiante = student;
    }

    // Cambiar curso
    if (dto.courseId) {
      const course = await this.coursesRepository.findOneBy({
        id: dto.courseId,
      });
      if (!course)
        throw new NotFoundException(
          `No existe el curso con id ${dto.courseId}`,
        );
      enrollment.curso = course;
    }

    try {
      await this.enrollmentsRepository.save(enrollment);
      return enrollment;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async removeEnrollment(id: string) {
    const enrollment = await this.findOneById(id);
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
