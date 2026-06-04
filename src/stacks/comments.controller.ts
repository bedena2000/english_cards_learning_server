import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { CreateCommentDto } from "./dto/create-comment.dto";


@Controller('stacks/:stackId/comments')
export class CommentsController {
    constructor(private commentsService: CommentsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@CurrentUser() user, @Param('stackId') stackId: string, @Body() dto: CreateCommentDto) {
        return this.commentsService.create(
            BigInt(user.sub),
            BigInt(stackId),
            dto
        )
    };

    @Delete(':commentId')
    @UseGuards(JwtAuthGuard)
    remove(
        @CurrentUser() user,
        @Param('stackId') stackId: string,
        @Param('commentId') commentId: string
    ) {
        return this.commentsService.remove(
            BigInt(user.sub),
            BigInt(stackId),
            BigInt(commentId),
        );
    }
}