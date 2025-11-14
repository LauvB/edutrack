import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsDateString()
  @IsNotEmpty()
  fechaInscripcion: Date;

  @IsNumber()
  @IsOptional()
  nota?: number;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
