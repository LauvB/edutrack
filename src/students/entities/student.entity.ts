import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from '../interfaces/student.interface';
import { UserEntity } from 'src/users/entities/user.entity';
import { EnrollmentEntity } from 'src/enrollments/entities/enrollment.entity';

@Entity('students')
export class StudentEntity implements Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'año_ingreso' })
  añoIngreso: number;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  usuario: UserEntity;

  @OneToMany(() => EnrollmentEntity, (ins) => ins.estudiante)
  inscripciones: EnrollmentEntity[];
}
