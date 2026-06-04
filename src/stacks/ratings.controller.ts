import {
    Body,
    Controller,
    Delete,
    Param,
    Put,
    UseGuards,
  } from '@nestjs/common';
  import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
  import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
  import { RatingsService } from './ratings.service';
  import { UpsertRatingDto } from './dto/upsert-rating.dto';
  
  @Controller('stacks/:stackId/ratings')
  export class RatingsController {
    constructor(private ratingsService: RatingsService) {}
  
    @Put()
    @UseGuards(JwtAuthGuard)
    upsert(
      @CurrentUser() user,
      @Param('stackId') stackId: string,
      @Body() dto: UpsertRatingDto,
    ) {
      return this.ratingsService.upsert(
        BigInt(user.sub),
        BigInt(stackId),
        dto,
      );
    }
  
    @Delete()
    @UseGuards(JwtAuthGuard)
    remove(@CurrentUser() user, @Param('stackId') stackId: string) {
      return this.ratingsService.remove(BigInt(user.sub), BigInt(stackId));
    }
}