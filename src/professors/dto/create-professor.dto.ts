import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProfessorDto {
  @IsString()
  @IsNotEmpty()
  especialidad: string;

  // Relación OneToOne con User
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
