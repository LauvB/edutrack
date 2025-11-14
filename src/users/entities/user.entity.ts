import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../interfaces/user.interface';
import { UserRole } from '../interfaces/userRole';

@Entity({ name: 'users' })
export class UserEntity implements User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('text', { name: 'nombre_completo' })
  nombreCompleto: string;

  @Column('text', { unique: true })
  correo: string;

  @Column('text', {
    nullable: false,
    select: false,
  })
  contraseña: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  rol: UserRole;
}
