import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsNumber()
  @IsNotEmpty()
  anioIngreso: number;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
