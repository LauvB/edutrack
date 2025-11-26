import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../../users/entities/user.entity';
import { ProfessorEntity } from '../../professors/entities/professor.entity';
import { UserRole } from '../../users/interfaces/userRole';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfessorsSeeder {
  private readonly logger = new Logger('ProfessorsSeeder');

  private readonly data = [
    {
      nombre: 'Duvan Tellez',
      correo: 'duvan@edutrack.com',
      especialidad: 'Cibernética',
    },
    {
      nombre: 'Beatriz Jaramillo',
      correo: 'beatriz@edutrack.com',
      especialidad: 'Redes',
    },
    {
      nombre: 'Helio Ramírez',
      correo: 'helio@edutrack.com',
      especialidad: 'Programación',
    },
  ];

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<ProfessorEntity>,
  ) {}

  async run() {
    this.logger.log('Seeding profesores...');

    for (const item of this.data) {
      const exists = await this.usersRepository.findOne({
        where: { correo: item.correo },
      });

      if (exists) {
        this.logger.log(`El profesor ${item.correo} ya existe.`);
        continue;
      }

      const hashed = await bcrypt.hash(
        'Profe123',
        Number(this.configService.get('SALT_ROUNDS')),
      );

      // Crear usuario profesor
      const user = this.usersRepository.create({
        nombreCompleto: item.nombre,
        correo: item.correo,
        contraseña: hashed,
        rol: UserRole.PROFESOR,
      });

      const savedUser = await this.usersRepository.save(user);

      // Crear perfil profesor
      const professor = this.professorsRepository.create({
        especialidad: item.especialidad,
        usuario: savedUser,
      });

      await this.professorsRepository.save(professor);

      this.logger.log(`Profesor ${item.nombre} creado exitosamente`);
    }
  }
}
