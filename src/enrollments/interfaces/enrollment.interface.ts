import { CourseEntity } from 'src/courses/entities/course.entity';
import { StudentEntity } from 'src/students/entities/student.entity';

export interface Enrollment {
  id?: string;
  fechaInscripcion: Date;
  nota?: number;
  estudiante: StudentEntity;
  curso: CourseEntity;
}
