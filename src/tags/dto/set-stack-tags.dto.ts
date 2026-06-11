import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class SetStackTagsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tagIds!: string[]
}