import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StacksService } from './stacks.service';
import { CreateStackDto } from './dto/create-stack/create-stack';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateStackDto } from './dto/update-stack/update-stack';
import { SetStackTagsDto } from 'src/tags/dto/set-stack-tags.dto';

@Controller('stacks')
export class StacksController {
  constructor(private stacksService: StacksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user, @Body() dto: CreateStackDto) {
    return this.stacksService.create(BigInt(user.sub), dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user,
    @Query('page') page = '1',
    @Query('limit') limit = 10,
  ) {
    return this.stacksService.findAll(
      BigInt(user.sub),
      Number(page),
      Number(limit),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() dto: UpdateStackDto,
  ) {
    return this.stacksService.update(BigInt(user.sub), BigInt(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user, @Param('id') id: string) {
    return this.stacksService.remove(BigInt(user.sub), BigInt(id));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @CurrentUser() user: { sub: string } | undefined,
    @Param('id') id: string,
  ) {
    const userId = user ? BigInt(user.sub) : null;
    return this.stacksService.findOne(userId, BigInt(id));
  }

  @Post(':id/tags')
  @UseGuards(JwtAuthGuard)
  setTags(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() dto: SetStackTagsDto,
  ) {
    return this.stacksService.setTagsOnStack(
      BigInt(user.sub),
      BigInt(id),
      dto.tagIds,
    );
  }
}
