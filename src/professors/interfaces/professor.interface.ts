import { User } from 'src/users/interfaces/user.interface';

export interface Professor {
  id?: string;
  especialidad: string;
  usuario: User;
}
