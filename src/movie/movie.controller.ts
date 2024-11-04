import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieFilterDto } from './dtos/movie-filter.dto';
import { PaginationDto } from './dtos/pagination.dto';
import { AuthGuard } from 'src/auth/auth-guard';
import { RateMovieDto } from './dtos/rate-movie.dto';
import { UserId } from 'src/user/decorators/user-id.decorator';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post('populate')
  async popularMovies(@Query('moviesNumber') moviesNumber: number) {
    return await this.movieService.populateMovies(moviesNumber);
  }
  
  @Get()
  async getMovies(
    @Query() filter: MovieFilterDto,
    @Query() pagination: PaginationDto,
  ) {
    return await this.movieService.getMovies(filter, pagination);
  }


  @UseGuards(AuthGuard)
  @Get('favorites')
  async myFavorite(
    @UserId() userId: number
  ) {
    return this.movieService.getMyFavorites(userId);
  }
  
  @Get('/:id')
  async getOne(@Param('id') id: number) {
    return await this.movieService.getMovieById(id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/rate')
  async rate(@Param('id') id: number, @Body() rateMovieDto: RateMovieDto) {
    return this.movieService.rateMovie(id, rateMovieDto.rating);
  }

  @UseGuards(AuthGuard)
  @Post(':movieId/favorite')
  async favorite(
    @Param('movieId') movieId: number,
    @UserId() userId: number
  ) {
    return this.movieService.favoriteMovie(userId,movieId);
  }

  @UseGuards(AuthGuard)
  @Post(':movieId/unfavorite')
  async unfavorite(
    @Param('movieId') movieId: number,
    @UserId() userId: number
  ) {
    return this.movieService.unfavoriteMovie(userId,movieId);
  }

}
