import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  frontText?: string;

  @IsOptional()
  @IsString()
  backText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
