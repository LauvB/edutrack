import { ProfessorEntity } from 'src/professors/entities/professor.entity';
import { Course } from '../interfaces/course.interface';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EnrollmentEntity } from 'src/enrollments/entities/enrollment.entity';

@Entity({ name: 'courses' })
export class CourseEntity implements Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column()
  creditos: number;

  @ManyToOne(() => ProfessorEntity, (prof) => prof.cursos, { eager: true })
  profesor: ProfessorEntity;

  @OneToMany(() => EnrollmentEntity, (ins) => ins.curso)
  inscripciones: EnrollmentEntity[];
}
