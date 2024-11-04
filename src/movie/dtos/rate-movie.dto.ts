// src/movie/dto/rate-movie.dto.ts
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RateMovieDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(8) 
  rating: number;
}
