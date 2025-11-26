import { StudentEntity } from '../../students/entities/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Enrollment } from '../interfaces/enrollment.interface';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity({ name: 'enrollments' })
@Unique('student_course_unique', ['estudiante', 'curso'])
export class EnrollmentEntity implements Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_inscripcion', type: 'date' })
  fechaInscripcion: Date;

  @Column({ nullable: true })
  nota: number;

  @ManyToOne(() => StudentEntity, (est) => est.inscripciones, {
    eager: true,
    onDelete: 'CASCADE',
  })
  estudiante: StudentEntity;

  @ManyToOne(() => CourseEntity, (course) => course.inscripciones, {
    eager: true,
    onDelete: 'CASCADE',
  })
  curso: CourseEntity;
}
