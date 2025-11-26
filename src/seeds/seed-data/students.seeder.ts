import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../../users/entities/user.entity';
import { StudentEntity } from '../../students/entities/student.entity';
import { UserRole } from '../../users/interfaces/userRole';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentsSeeder {
  private readonly logger = new Logger('StudentsSeeder');

  private readonly data = [
    { nombre: 'Juan Pérez', correo: 'juan@edutrack.com', ingreso: 2023 },
    { nombre: 'María López', correo: 'maria@edutrack.com', ingreso: 2022 },
    { nombre: 'Pedro Ramírez', correo: 'pedro@edutrack.com', ingreso: 2024 },
    { nombre: 'Laura Torres', correo: 'laura@edutrack.com', ingreso: 2021 },
  ];

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
  ) {}

  async run() {
    this.logger.log('Seeding estudiantes...');

    for (const item of this.data) {
      const exists = await this.usersRepository.findOne({
        where: { correo: item.correo },
      });

      if (exists) {
        this.logger.log(`El estudiante ${item.correo} ya existe.`);
        continue;
      }

      const hashed = await bcrypt.hash(
        'Estudiante123*',
        Number(this.configService.get('SALT_ROUNDS')),
      );

      // Crear usuario estudiante
      const user = this.usersRepository.create({
        nombreCompleto: item.nombre,
        correo: item.correo,
        contraseña: hashed,
        rol: UserRole.ESTUDIANTE,
      });

      const savedUser = await this.usersRepository.save(user);

      // Crear perfil estudiante
      const student = this.studentsRepository.create({
        anioIngreso: item.ingreso,
        usuario: savedUser,
      });

      await this.studentsRepository.save(student);

      this.logger.log(`Estudiante ${item.nombre} creado exitosamente`);
    }
  }
}
