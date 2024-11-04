import { ApiProperty } from '@nestjs/swagger';

class GenreDto {
  @ApiProperty({ example: 53, description: 'The genre ID' })
  id: number;

  @ApiProperty({ example: 'Thriller', description: 'The name of the genre' })
  name: string;
}

export class WholeMovieReturnDto {
  @ApiProperty({ example: 2826, description: 'The unique ID of the movie' })
  id: number;

  @ApiProperty({ example: 'Terrifier 3', description: 'The title of the movie' })
  title: string;

  @ApiProperty({
    example: "Five years after surviving Art the Clown's Halloween massacre...",
    description: 'A brief overview of the movie plot'
  })
  overview: string;

  @ApiProperty({ example: '1034541', description: 'The ID of the movie on The Movies Database (TMDb)' })
  theMoviesDbId: number;

  @ApiProperty({ example: '2024-10-08T21:00:00.000Z', description: 'The release date of the movie in ISO format' })
  releaseDate: Date;

  @ApiProperty({ example: '7.286', description: 'The average vote score for the movie' })
  voteAverage: number;

  @ApiProperty({ example: 555, description: 'The total Date of votes for the movie' })
  voteCount: number;

  @ApiProperty({ type: [GenreDto], description: 'List of genres associated with the movie' })
  genres: GenreDto[];
}
