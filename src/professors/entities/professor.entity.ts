import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Professor } from '../interfaces/professor.interface';
import { UserEntity } from '../../users/entities/user.entity';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity({ name: 'professors' })
export class ProfessorEntity implements Professor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  especialidad: string;

  @OneToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  usuario: UserEntity;

  @OneToMany(() => CourseEntity, (course) => course.profesor)
  cursos: CourseEntity[];
}
