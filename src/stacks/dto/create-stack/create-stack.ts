import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateStackDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description!: string;

  @IsOptional()
  @IsIn(['public', 'private'])
  visibility!: 'public' | 'private';
}
