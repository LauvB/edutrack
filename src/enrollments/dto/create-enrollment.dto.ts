import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsDateString(
    {},
    {
      message: 'La fecha de inscripción debe tener formato YYYY-MM-DD',
    },
  )
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
