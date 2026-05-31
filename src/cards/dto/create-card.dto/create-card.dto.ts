import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  frontText!: string;

  @IsString()
  @IsNotEmpty()
  backText!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
