import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateCardDto } from './dto/create-card.dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('stacks/:stackId/cards')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user,
    @Param('stackId') stackId: string,
    @Body() dto: CreateCardDto,
  ) {
    const userId = BigInt(user.sub ?? user.id);
    return this.cardsService.create(userId, BigInt(stackId), dto);
  }

  @Get('stacks/:stackId/cards')
  findByStack(
    @CurrentUser() user: any | null,
    @Param('stackId') stackId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const userId = user ? BigInt(user.sub ?? user.id) : null;
    return this.cardsService.findByStack(
      userId,
      BigInt(stackId),
      Number(page),
      Number(limit),
    );
  }

  @Get('cards/:id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(BigInt(id));
  }

  @Patch('cards/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    const userId = BigInt(user.sub ?? user.id);
    return this.cardsService.update(userId, BigInt(id), dto);
  }

  @Delete('cards/:id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    const userId = BigInt(user.sub ?? user.id);
    return this.cardsService.remove(userId, BigInt(id));
  }
}
