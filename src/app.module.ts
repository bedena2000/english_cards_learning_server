import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StacksModule } from './stacks/stacks.module';
import { CardsModule } from './cards/cards.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, StacksModule, CardsModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
