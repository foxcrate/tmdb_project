import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieFilterDto } from './dtos/movie-filter.dto';
import { PaginationDto } from './dtos/pagination.dto';
import { AuthGuard } from '../auth/guards/auth-guard';
import { RateMovieDto } from './dtos/rate-movie.dto';
import { UserId } from '../user/decorators/user-id.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MovieEntity } from './entites/movies.entity';
import { WholeMovieReturnDto } from './dtos/whole-movie-return.dto';
import { UserWithMoviesDto } from 'src/user/dtos/user-with-movies.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @ApiOperation({ summary: 'Populate movies using TMDB API'})
  @ApiQuery({ name: 'moviesNumber', required: false })
  @Post('populate')
  async popularMovies(@Query('moviesNumber') moviesNumber: number) {
    return await this.movieService.populateMovies(moviesNumber);
  }
  
  @ApiOperation({ summary: 'Get all movies'})
  @ApiCreatedResponse({
    type: WholeMovieReturnDto,
    isArray: true,
  })
  @Get()
  async getMovies(
    @Query() filter: MovieFilterDto,
    @Query() pagination: PaginationDto,
  ) {
    return await this.movieService.getMovies(filter, pagination);
  }


  @ApiOperation({ summary: 'Get my favorite movies'})
  @ApiCreatedResponse({
    type: WholeMovieReturnDto,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('favorites')
  async myFavorite(
    @UserId() userId: number
  ) {
    return this.movieService.getMyFavorites(userId);
  }
  
  @ApiParam({
    name: 'id',
  })
  @ApiOperation({ summary: 'Get one movie'})
  @ApiCreatedResponse({
    type: WholeMovieReturnDto,
  })
  @Get('/:id')
  async getOne(@Param('id') id: number) {
    return await this.movieService.getMovieById(id);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: WholeMovieReturnDto,
  })
  @ApiOperation({ summary: 'Rate a movie (from 1 to 8)'})
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post(':id/rate')
  async rate(@Param('id') id: number, @Body() rateMovieDto: RateMovieDto) {
    return this.movieService.rateMovie(id, rateMovieDto.rating);
  }

  @ApiParam({
    name: 'movieId',
  })
  @ApiCreatedResponse({
    type: UserWithMoviesDto,
  })
  @ApiOperation({ summary: 'Add movie to favorites'})
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post(':movieId/favorite')
  async favorite(
    @Param('movieId') movieId: number,
    @UserId() userId: number
  ) {
    return this.movieService.favoriteMovie(userId,movieId);
  }

  @ApiParam({
    name: 'movieId',
  })
  @ApiCreatedResponse({
    type: UserWithMoviesDto,
  })
  @ApiOperation({ summary: 'Remove movie from your favorites'})
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post(':movieId/unfavorite')
  async unfavorite(
    @Param('movieId') movieId: number,
    @UserId() userId: number
  ) {
    return this.movieService.unfavoriteMovie(userId,movieId);
  }

}
