import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: bigint, stackId: bigint, dto: CreateCardDto) {
    const stack = await this.prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack) throw new NotFoundException('Stack not found');
    if (stack.ownerId !== userId)
      throw new ForbiddenException('Not owner of stack');

    const card = await this.prisma.card.create({
      data: {
        stackId,
        frontText: dto.frontText,
        backText: dto.backText,
        position: dto.position ?? 0,
      },
    });

    return {
      id: card.id.toString(),
      stackId: card.stackId.toString(),
      frontText: card.frontText,
      backText: card.backText,
      position: card.position,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  async findByStack(
    userId: bigint | null,
    stackId: bigint,
    page = 1,
    limit = 50,
  ) {
    const stack = await this.prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (stack?.visibility === 'private' && stack.ownerId !== userId) {
      throw new ForbiddenException('Stack is private');
    }

    const skip = (page - 1) * limit;

    const cards = await this.prisma.card.findMany({
      where: { stackId },
      skip,
      take: limit,
      orderBy: { position: 'asc' },
    });

    return cards.map((c) => ({
      id: c.id.toString(),
      stackId: c.stackId.toString(),
      frontText: c.frontText,
      backText: c.backText,
      position: c.position,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async findOne(id: bigint) {
    const card = await this.prisma.card.findUnique({ where: { id } });

    if (!card) throw new NotFoundException('Card not found');

    return {
      id: card.id.toString(),
      stackId: card.stackId.toString(),
      frontText: card.frontText,
      backText: card.backText,
      position: card.position,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  async update(userId: bigint, cardId: bigint, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });

    const stack = await this.prisma.stack.findUnique({
      where: { id: card?.stackId },
    });

    if (!stack) throw new NotFoundException('Parent stack not found');
    if (stack.ownerId !== userId) throw new ForbiddenException('Not owner');

    const updated = await this.prisma.card.update({
      where: { id: cardId },
      data: dto,
    });

    return {
      id: updated.id.toString(),
      stackId: updated.stackId.toString(),
      frontText: updated.frontText,
      backText: updated.backText,
      position: updated.position,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(userId: bigint, cardId: bigint) {
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');

    const stack = await this.prisma.stack.findUnique({
      where: { id: card.stackId },
    });
    if (!stack) throw new NotFoundException('Parent stack not found');
    if (stack.ownerId !== userId) throw new ForbiddenException('Not owner');

    const deleted = await this.prisma.card.delete({ where: { id: cardId } });
    return { id: deleted.id.toString() };
  }
}
