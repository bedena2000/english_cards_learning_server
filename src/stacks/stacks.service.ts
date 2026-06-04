import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStackDto } from './dto/create-stack/create-stack';
import { UpdateStackDto } from './dto/update-stack/update-stack';
import { Stack } from '@prisma/client';

@Injectable()
export class StacksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: bigint, dto: CreateStackDto) {
    const stack = await this.prisma.stack.create({
      data: {
        title: dto.title,
        description: dto.description,
        visibility: dto.visibility ?? 'private',
        ownerId: userId,
      },
    });

    return {
      id: stack.id.toString(),
      title: stack.title,
      description: stack.description,
      visibility: stack.visibility,
      ownerId: stack.ownerId.toString(),
      createdAt: stack.createdAt,
      updatedAt: stack.updatedAt,
    };
  }

  async findAll(userId: bigint, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const stacks = await this.prisma.stack.findMany({
      where: {
        OR: [
          { ownerId: userId },

          {
            visibility: 'public',
          },
        ],
      },

      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stacks.map((stack) => ({
      id: stack.id.toString(),
      title: stack.title,
      description: stack.description,
      visibility: stack.visibility,
      ownerId: stack.ownerId.toString(),
      createdAt: stack.createdAt,
      updatedAt: stack.updatedAt,
    }));
  }

  async update(userId: bigint, stackId: bigint, dto: UpdateStackDto) {
    const stack = await this.prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack) {
      throw new NotFoundException('Stack not found');
    }

    if (stack.ownerId !== userId) {
      throw new ForbiddenException('You are not owner');
    }

    const updated = await this.prisma.stack.update({
      where: { id: stackId },
      data: dto,
    });

    return {
      id: updated.id.toString(),
      title: updated.title,
      description: updated.description,
      visibility: updated.visibility,
      ownerId: updated.ownerId.toString(),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(userId: bigint, stackId: bigint) {
    const stack = await this.prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack) {
      throw new NotFoundException('Stack not found');
    }

    if (stack.ownerId !== userId) {
      throw new ForbiddenException('You are not owner');
    }

    const deteleted = await this.prisma.stack.delete({
      where: { id: stackId },
    });

    return { success: true };
  }


  async getStackOrThrow(stackId: bigint): Promise<Stack> {
    const stack = await this.prisma.stack.findUnique({
      where: { id: stackId }
    });

    if(!stack) {
      throw new NotFoundException('Stack not found');
    }

    return stack;
  };

  assertCanView(stack: Stack, userId: bigint | null) {
    if(stack.visibility === 'private' && stack.ownerId !== userId) {
      throw new ForbiddenException('Stack is private');
    }
  };

  async findOne(userId: bigint | null, stackId: bigint) {
    const stack = await this.getStackOrThrow(stackId);
    this.assertCanView(stack, userId);
    const [cards, comments, ratingsAgg, myRating] = await Promise.all([
      this.prisma.card.findMany({
        where: { stackId },
        orderBy: { position: 'asc' },
      }),
      this.prisma.stackComment.findMany({
        where: { stackId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true } },
        },
      }),
      this.prisma.stackRating.aggregate({
        where: { stackId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      userId
        ? this.prisma.stackRating.findUnique({
            where: { stackId_userId: { stackId, userId } },
          })
        : Promise.resolve(null),
    ]);
    return {
      stack: {
        id: stack.id.toString(),
        title: stack.title,
        description: stack.description,
        visibility: stack.visibility,
        ownerId: stack.ownerId.toString(),
        createdAt: stack.createdAt,
        updatedAt: stack.updatedAt,
      },
      cards: cards.map((c) => ({
        id: c.id.toString(),
        frontText: c.frontText,
        backText: c.backText,
        position: c.position,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      comments: comments.map((c) => ({
        id: c.id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.user.id.toString(),
          username: c.user.username,
        },
      })),
      ratingsSummary: {
        average: ratingsAgg._avg.rating ?? null,
        count: ratingsAgg._count.rating,
      },
      myRating: myRating
        ? { rating: myRating.rating, updatedAt: myRating.updatedAt }
        : null,
    };
  }
}
