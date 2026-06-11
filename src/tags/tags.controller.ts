import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateTagDto } from './dto/create-tag';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user, @Body() dto: CreateTagDto) {
    return this.tagsService.create(BigInt(user.sub), dto);
  }
}
