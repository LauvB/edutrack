import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Professor } from '../interfaces/professor.interface';
import { UserEntity } from 'src/users/entities/user.entity';
import { CourseEntity } from 'src/courses/entities/course.entity';

@Entity({ name: 'professors' })
export class ProfessorEntity implements Professor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  especialidad: string;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  usuario: UserEntity;

  @OneToMany(() => CourseEntity, (course) => course.profesor)
  cursos: CourseEntity[];
}
