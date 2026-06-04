import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StacksService } from "./stacks.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private stacksService: StacksService
  ) {}

  async create(userId: bigint, stackId: bigint, dto: CreateCommentDto) {
    const stack = await this.stacksService.getStackOrThrow(stackId);

    this.stacksService.assertCanView(stack, userId);

    const comment = await this.prisma.stackComment.create({
        data: {
            stackId,
            userId,
            content: dto.content
        },
        include: {
            user: { select: { id: true, username: true } }
        }
    });

    return {
        id: comment.id.toString(),
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
            id: comment.user.id.toString(),
            username: comment.user.username,
        },
    }
  };

  async remove(userId: bigint, stackId: bigint, commentId: bigint) {
    const stack = await this.stacksService.getStackOrThrow(stackId);
    this.stacksService.assertCanView(stack, userId);

    const comment = await this.prisma.stackComment.findFirst({
        where: { id: commentId, stackId } 
    });

    if(!comment) {
        throw new NotFoundException('Comment not found');
    };

    const isAuthor = comment.userId === userId;
    const isOwner = stack.ownerId === userId;

    if(!isAuthor && !isOwner) {
        throw new ForbiddenException('You are not authorized to delete this comment');
    }

    await this.prisma.stackComment.delete({ where: { id: commentId } });
    return { success: true };
  }
}