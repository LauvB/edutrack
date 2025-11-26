import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from '../interfaces/student.interface';
import { UserEntity } from '../../users/entities/user.entity';
import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';

@Entity('students')
export class StudentEntity implements Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'año_ingreso' })
  anioIngreso: number;

  @OneToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  usuario: UserEntity;

  @OneToMany(() => EnrollmentEntity, (ins) => ins.estudiante, {
    cascade: ['remove'],
  })
  inscripciones: EnrollmentEntity[];
}
