import { User } from 'src/users/interfaces/user.interface';

export interface Student {
  id?: string;
  añoIngreso: number;
  usuario: User;
}
