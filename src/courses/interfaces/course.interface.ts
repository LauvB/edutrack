import { Professor } from 'src/professors/interfaces/professor.interface';

export interface Course {
  id?: string;
  nombre: string;
  descripcion: string;
  creditos: number;
  profesor: Professor;
}
