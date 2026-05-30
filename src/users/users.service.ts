import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(email: string, username: string, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
    });
  }
}
