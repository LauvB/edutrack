import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CourseEntity } from '../../courses/entities/course.entity';
import { ProfessorEntity } from '../../professors/entities/professor.entity';

@Injectable()
export class CoursesSeeder {
  private readonly logger = new Logger('CoursesSeeder');

  constructor(
    @InjectRepository(CourseEntity)
    private readonly coursesRepository: Repository<CourseEntity>,

    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<ProfessorEntity>,
  ) {}

  async run() {
    // obtener profesores existentes
    const profesores = await this.professorsRepository.find();

    if (profesores.length === 0) {
      this.logger.error('No se pueden crear cursos: no hay profesores.');
      return;
    }

    // Datos de ejemplo
    const cursosData = [
      {
        nombre: 'Programación I',
        descripcion: 'Introducción a la programación estructurada.',
        creditos: 3,
      },
      {
        nombre: 'Bases de Datos',
        descripcion: 'Modelado relacional y SQL.',
        creditos: 4,
      },
      {
        nombre: 'Cálculo Diferencial',
        descripcion: 'Funciones, derivadas y aplicaciones.',
        creditos: 3,
      },
      {
        nombre: 'Estructuras de Datos',
        descripcion: 'Listas, árboles, pilas, colas y algoritmos básicos.',
        creditos: 4,
      },
    ];

    for (let i = 0; i < cursosData.length; i++) {
      const prof = profesores[i % profesores.length]; // alternar profesores

      const exists = await this.coursesRepository.findOne({
        where: { nombre: cursosData[i].nombre },
      });

      if (exists) {
        this.logger.log(`⚠ Curso '${exists.nombre}' ya existe. Saltando.`);
        continue;
      }

      const curso = this.coursesRepository.create({
        ...cursosData[i],
        profesor: prof,
      });

      await this.coursesRepository.save(curso);

      this.logger.log(
        `✔ Curso creado: ${curso.nombre} (Profesor: ${prof.usuario.nombreCompleto})`,
      );
    }

    this.logger.log('✔ Seed de cursos completado.');
  }
}
