import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await this.usersService.create(email, username, hash);

      return {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Wrong password');
    }

    const token = this.jwtService.sign({
      sub: user.id.toString(),
      email: user.email,
    });

    return {
      message: 'Login success',
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  }
}
