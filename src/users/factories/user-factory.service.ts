import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Professor } from 'src/professors/interfaces/professor.interface';
import { Student } from 'src/students/interfaces/student.interface';
import { Repository } from 'typeorm';
import { UserRole } from '../interfaces/userRole';
import { ProfessorEntity } from 'src/professors/entities/professor.entity';
import { StudentEntity } from 'src/students/entities/student.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserFactoryService {
  constructor(
    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<Professor>,

    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  /**
   * Después de crear un usuario.
   * Según el rol, crea el registro correspondiente en Professor o Student.
   */
  async handleUserCreation(user: UserEntity): Promise<void> {
    if (user.rol === UserRole.PROFESOR) {
      await this.createProfessorFromUser(user);
    }

    if (user.rol === UserRole.ESTUDIANTE) {
      await this.createStudentFromUser(user);
    }
  }

  private async createProfessorFromUser(user: UserEntity): Promise<Professor> {
    const professor = this.professorsRepository.create({
      especialidad: 'Pendiente por definir', // valor por defecto
      usuario: user,
    });

    return await this.professorsRepository.save(professor);
  }

  private async createStudentFromUser(user: UserEntity): Promise<Student> {
    const currentYear = new Date().getFullYear();

    const student = this.studentsRepository.create({
      anioIngreso: currentYear,
      usuario: user,
    });

    return await this.studentsRepository.save(student);
  }
}
