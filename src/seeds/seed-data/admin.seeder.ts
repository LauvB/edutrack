import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../users/interfaces/userRole';

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger('AdminSeeder');

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const adminEmail = 'admin@edutrack.com';

    const exists = await this.usersRepository.findOne({
      where: { correo: adminEmail },
      select: ['id'],
    });

    if (exists) {
      this.logger.log('Admin ya existe, no se crea.');
      return;
    }

    const hashed = await bcrypt.hash(
      'Admin123*',
      Number(this.configService.get('SALT_ROUNDS')),
    );

    const admin = this.usersRepository.create({
      nombreCompleto: 'Administrador del Sistema',
      correo: adminEmail,
      contraseña: hashed,
      rol: UserRole.ADMIN,
    });

    await this.usersRepository.save(admin);

    this.logger.log('Admin creado con éxito: admin@edutrack.com');
  }
}
