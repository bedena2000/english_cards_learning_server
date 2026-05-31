import { Module } from '@nestjs/common';
import { StacksController } from './stacks.controller';
import { StacksService } from './stacks.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StacksController],
  providers: [StacksService],
})
export class StacksModule {}
