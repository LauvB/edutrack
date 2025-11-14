import { IsString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @IsNotEmpty()
  creditos: number;

  // Relación con Professor
  @IsUUID()
  @IsNotEmpty()
  professorId: string;
}
