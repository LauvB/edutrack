import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';
import { StudentEntity } from '../../students/entities/student.entity';
import { CourseEntity } from '../../courses/entities/course.entity';

@Injectable()
export class EnrollmentsSeeder {
  private readonly logger = new Logger('EnrollmentsSeeder');

  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
  ) {}

  async run() {
    this.logger.log('Iniciando seeder de inscripciones...');

    const estudiantes = await this.studentRepo.find();
    const cursos = await this.courseRepo.find();

    if (estudiantes.length === 0) {
      this.logger.error('No hay estudiantes para crear inscripciones.');
      return;
    }

    if (cursos.length === 0) {
      this.logger.error('No hay cursos para crear inscripciones.');
      return;
    }

    const inscripcionesARealizar: Partial<EnrollmentEntity>[] = [];

    // Asignar un curso aleatorio a cada estudiante
    for (const estudiante of estudiantes) {
      const cursoAleatorio = cursos[Math.floor(Math.random() * cursos.length)];

      inscripcionesARealizar.push({
        fechaInscripcion: new Date('2024-03-01'),
        estudiante: estudiante,
        curso: cursoAleatorio,
      });
    }

    for (const data of inscripcionesARealizar) {
      // Evitar inscripciones repetidas por el @Unique
      const exists = await this.enrollmentRepo.findOne({
        where: {
          estudiante: { id: data.estudiante?.id },
          curso: { id: data.curso?.id },
        },
      });

      if (exists) {
        this.logger.log(
          `⚠ Inscripción ya existente: ${data.estudiante?.usuario.nombreCompleto} → ${data.curso?.nombre}`,
        );
        continue;
      }

      const enrollment = this.enrollmentRepo.create({
        fechaInscripcion: data.fechaInscripcion,
        estudiante: data.estudiante,
        curso: data.curso,
      });

      await this.enrollmentRepo.save(enrollment);

      this.logger.log(
        `✔ Inscripción creada: ${data.estudiante?.usuario.nombreCompleto} → ${data.curso?.nombre}`,
      );
    }

    this.logger.log('Seeder de inscripciones completado.');
  }
}
