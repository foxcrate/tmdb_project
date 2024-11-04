import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class MovieFilterDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  releaseDate?: Date;

  @IsOptional()
  voteAverage?: string;

  @IsOptional()
  genreId?: string;
}
