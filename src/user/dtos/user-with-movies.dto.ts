import { ApiProperty } from '@nestjs/swagger';

class MovieDto {
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
  theMoviesDbId: string;

  @ApiProperty({ type: Date,example: '2024-10-08T21:00:00.000Z', description: 'The release date of the movie in ISO format' })
  releaseDate: Date;

  @ApiProperty({ example: '7.286', description: 'The average vote score for the movie' })
  voteAverage: string;

  @ApiProperty({ example: 555, description: 'The total number of votes for the movie' })
  voteCount: number;
}

export class UserWithMoviesDto {
  @ApiProperty({ example: 1, description: 'The unique ID of the user' })
  id: number;

  @ApiProperty({ example: 'ahemd3@gmail.com', description: 'The email address of the user' })
  email: string;

  @ApiProperty({ type: [MovieDto], description: 'List of movies associated with the user' })
  movies: MovieDto[];
}
