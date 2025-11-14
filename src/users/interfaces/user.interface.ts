import { UserRole } from './userRole';

export interface User {
  id?: string;
  nombreCompleto: string;
  correo: string;
  contraseña: string;
  rol: UserRole;
}
