import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag';
import { Prisma, Tag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: bigint, dto: CreateTagDto) {
    try {
      const tag = await this.prisma.tag.create({
        data: {
          userId,
          name: dto.name.trim(),
        },
      });

      return this.mapTag(tag);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tag already exists');
      }

      throw error;
    }
  }

  private mapTag(tag: Tag) {
    return {
      id: tag.id.toString(),
      userId: tag.userId.toString(),
      name: tag.name,
    };
  }
}
