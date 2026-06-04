import { Module } from '@nestjs/common';
import { StacksController } from './stacks.controller';
import { StacksService } from './stacks.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StacksController, CommentsController, RatingsController],
  providers: [StacksService, CommentsService, RatingsService],
})
export class StacksModule {}