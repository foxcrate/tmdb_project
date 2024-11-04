import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RateMovieDto {
  @ApiProperty({ example: 7, description: 'The rating of the movie', minimum: 1, maximum: 8,type: Number })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(8) 
  rating: number;
}
