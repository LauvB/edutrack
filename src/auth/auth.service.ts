import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(correo: string, password: string) {
    const user = await this.usersService.findByEmail(correo);

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const passwordMatches = await bcrypt.compare(password, user.contraseña);

    if (!passwordMatches)
      throw new UnauthorizedException('Credenciales incorrectas');

    return user;
  }

  async login(correo: string, contraseña: string) {
    const user = await this.validateUser(correo, contraseña);

    const payload = {
      id: user.id,
      rol: user.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
