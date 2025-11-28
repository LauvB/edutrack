import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfessorEntity } from './entities/professor.entity';
import { isUUID } from 'class-validator';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Injectable()
export class ProfessorsService {
  private readonly logger = new Logger('ProfessorsService');

  constructor(
    @InjectRepository(ProfessorEntity)
    private readonly professorsRepository: Repository<ProfessorEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createProfessor(dto: CreateProfessorDto) {
    try {
      const user = await this.usersRepository.findOneBy({ id: dto.userId });

      if (!user) {
        throw new NotFoundException(
          `No existe un usuario con id ${dto.userId}`,
        );
      }

      if (user.rol !== 'profesor') {
        throw new BadRequestException(
          'El usuario debe tener rol "profesor" para crear perfil de profesor',
        );
      }

      const existingProfile = await this.professorsRepository.findOne({
        where: { usuario: { id: dto.userId } },
      });

      if (existingProfile) {
        throw new BadRequestException(
          'Este usuario ya tiene un perfil de profesor. Use PATCH para actualizar.',
        );
      }

      const professor = this.professorsRepository.create({
        especialidad: dto.especialidad,
        usuario: user,
      });

      await this.professorsRepository.save(professor);
      return `Perfil de profesor creado correctamente`;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findAll() {
    try {
      const professors: ProfessorEntity[] =
        await this.professorsRepository.find();
      return professors;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findOneById(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('El id no es válido');
    }

    try {
      const professor = await this.professorsRepository.findOneBy({ id });

      if (!professor) {
        throw new NotFoundException(`Profesor con id ${id} no encontrado`);
      }

      return professor;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findByUserId(userId: string) {
    const professor = await this.professorsRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['usuario', 'cursos'],
    });

    if (!professor) {
      throw new NotFoundException(
        `No existe un profesor asociado al usuario con id ${userId}`,
      );
    }

    return professor;
  }

  async updateProfessor(id: string, dto: UpdateProfessorDto, currentUser: any) {
    try {
      const professor = await this.professorsRepository.findOne({
        where: { id },
        relations: ['usuario'],
      });

      if (!professor) {
        throw new NotFoundException(`Profesor con id ${id} no encontrado`);
      }

      if (currentUser.rol !== 'admin') {
        if (professor.usuario.id !== currentUser.id) {
          throw new ForbiddenException('No puede actualizar este perfil.');
        }
      }

      const updatedProfessor = await this.professorsRepository.preload({
        id,
        ...dto,
      });

      if (!updatedProfessor) {
        throw new NotFoundException(`Error al actualizar el profesor`);
      }

      // Si quiere reasignar el usuario
      if (dto.userId) {
        const user = await this.usersRepository.findOneBy({
          id: dto.userId,
        });

        if (!user) {
          throw new NotFoundException(
            `Usuario con id ${dto.userId} no encontrado`,
          );
        }

        if (user.rol !== 'profesor') {
          throw new BadRequestException(
            'Solo un usuario con rol profesor puede ser asignado a este perfil',
          );
        }

        const existingProfile = await this.professorsRepository.findOne({
          where: { usuario: { id: dto.userId } },
        });

        if (existingProfile && existingProfile.id !== id) {
          throw new BadRequestException(
            'Este usuario ya tiene un perfil de profesor',
          );
        }

        updatedProfessor.usuario = user;
      }

      await this.professorsRepository.save(updatedProfessor);
      return updatedProfessor;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async removeProfessor(id: string, currentUser: any) {
    try {
      const professor = await this.findOneById(id);

      if (currentUser.rol !== 'admin') {
        if (professor.usuario.id !== currentUser.id) {
          throw new ForbiddenException('No puede eliminar este perfil.');
        }
      }

      await this.professorsRepository.remove(professor);
      return `Profesor con id ${id} eliminado correctamente`;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  private handleErrors(error: any): never {
    this.logger.error(error.message);

    if (error.code === '23505') {
      throw new BadRequestException(
        'Ya existe un profesor asociado a este usuario. Use PATCH para actualizar.',
      );
    }

    if (error.code === '23503') {
      throw new BadRequestException(
        'No se puede eliminar el profesor porque tiene cursos asociados. Reasigne o elimine los cursos antes de eliminarlo.',
      );
    }

    throw new BadRequestException(error.message);
  }
}
