import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

type AuthUser = {
  id: string;
  email: string;
  username: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResult = {
  user: AuthUser;
  tokens: AuthTokens;
};

@Injectable()
export class AuthService {
  private readonly accessTokenSecret =
    process.env.JWT_SECRET || 'your-secret-key';
  private readonly refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  private readonly accessTokenExpiresIn =
    process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  private readonly refreshTokenExpiresIn =
    process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private toAuthUser(user: {
    id: bigint;
    email: string;
    username: string;
  }): AuthUser {
    return {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
    };
  }

  private async createTokens(user: {
    id: bigint;
    email: string;
    username: string;
  }): Promise<AuthTokens> {
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<AuthResult> {
    if (!email || !username || !password) {
      throw new BadRequestException(
        'Email, username, and password are required',
      );
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await this.usersService.create(email, username, hash);
      const tokens = await this.createTokens(user);

      return { user: this.toAuthUser(user), tokens };
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

  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Wrong password');
    }

    const tokens = await this.createTokens(user);

    return {
      user: this.toAuthUser(user),
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        username?: string;
      }>(refreshToken, {
        secret: this.refreshTokenSecret,
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user || user.id.toString() !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.createTokens(user);

      return {
        user: this.toAuthUser(user),
        tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateAcessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      const { passwordHash, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
