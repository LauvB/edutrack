import {
  BadRequestException,
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

  async createCourse(createCourseDto: CreateCourseDto) {
    try {
      const profesor = await this.professorsRepository.findOneBy({
        id: createCourseDto.professorId,
      });
      if (!profesor) {
        throw new NotFoundException(
          `No existe el profesor con id ${createCourseDto.professorId}`,
        );
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

  async findAll() {
    try {
      const courses: CourseEntity[] = await this.coursesRepository.find();
      return { courses };
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async findOneById(id: string): Promise<CourseEntity | null | undefined> {
    if (!isUUID(id)) {
      throw new BadRequestException(`Id ${id} no es válido`);
    }

    try {
      const course = await this.coursesRepository.findOneBy({ id });
      if (!course)
        throw new NotFoundException(`Curso con id ${id} no encontrado`);
      return course;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    const existingCourse = await this.coursesRepository.preload({
      id,
      ...updateCourseDto,
    });

    if (!existingCourse) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    // Si viene nuevo profesor
    if (updateCourseDto.professorId) {
      const profesor = await this.professorsRepository.findOneBy({
        id: updateCourseDto.professorId,
      });

      if (!profesor) {
        throw new NotFoundException(
          `Profesor con id ${updateCourseDto.professorId} no existe`,
        );
      }

      existingCourse.profesor = profesor;
    }

    try {
      await this.coursesRepository.save(existingCourse);
      return existingCourse;
    } catch (error) {
      this.handlerErrors(error);
    }
  }

  async removeCourse(id: string) {
    const course = await this.findOneById(id);
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
