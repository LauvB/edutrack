import { StudentEntity } from 'src/students/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Enrollment } from '../interfaces/enrollment.interface';
import { CourseEntity } from 'src/courses/entities/course.entity';

@Entity({ name: 'enrollments' })
export class EnrollmentEntity implements Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_inscripcion', type: 'date' })
  fechaInscripcion: Date;

  @Column({ nullable: true })
  nota: number;

  @ManyToOne(() => StudentEntity, (est) => est.inscripciones, { eager: true })
  estudiante: StudentEntity;

  @ManyToOne(() => CourseEntity, (course) => course.inscripciones, {
    eager: true,
  })
  curso: CourseEntity;
}
