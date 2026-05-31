import { IsOptional, IsNumberString } from 'class-validator';

export class GetStacksDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  ownerId?: string;
}
