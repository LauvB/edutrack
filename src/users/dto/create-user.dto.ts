import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../interfaces/userRole';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  contraseña: string;

  @IsEnum(UserRole)
  rol: UserRole;
}
