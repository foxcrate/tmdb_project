import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { MovieEntity } from './entites/movies.entity';
import { In, LessThan, LessThanOrEqual, Like, MoreThan, Repository } from 'typeorm';
import { MovieFilterDto } from './dtos/movie-filter.dto';
import { PaginationDto } from './dtos/pagination.dto';
import { GenreEntity } from './entites/genre.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WholeMovieReturnDto } from './dtos/whole-movie-return.dto';

@Injectable()
export class MovieService {
  constructor(
    private readonly configService:ConfigService,
    private readonly userService:UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(MovieEntity) private moviesRepository: Repository<MovieEntity>,
    @InjectRepository(GenreEntity) private genreRepository: Repository<GenreEntity>
  ) {}

  async populateMovies(limit = 100): Promise<any> {

    let discoverApiUrl = this.configService.getOrThrow('TMDB_API_DISCOVER_URL');
    let apiKey = this.configService.getOrThrow('TMDB_API_KEY');

    //delete saved movies
    await this.moviesRepository.delete({});

    await this.populateGenre();

    let movies = [];
    let page = 1;

    while (movies.length < limit) {
      try {
        const response = await axios.get(discoverApiUrl, {
          params: {
            api_key:apiKey
          },
        });
        
        movies.push(...response.data.results);

        if (response.data.results.length < 20) break;
        page++;
      } catch (error) {
        console.log(error);
        
        throw new HttpException('Error fetching popular movies', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    movies  = movies.slice(0, limit); 
    // console.log(movies);

    for (const movie of movies) {
      let genres = await this.genreRepository.findBy({ id: In(movie.genre_ids) });
      if (genres.length !== movie.genre_ids.length) {
          throw new HttpException('Some genres not found', HttpStatus.BAD_REQUEST);
      }

      const newMovie = new MovieEntity();
      newMovie.title = movie.title;
      newMovie.overview = movie.overview;
      newMovie.theMoviesDbId = movie.id;
      newMovie.releaseDate = movie.release_date;
      newMovie.voteAverage = Number(movie.vote_average);
      newMovie.voteCount = movie.vote_count;
      newMovie.genres = genres;

      await this.moviesRepository.save(newMovie);
  }
    
    let allMovies =  await this.moviesRepository.find({ relations: ['genres'] });

    await this.cacheManager.set('theMovies', { data: allMovies});
    return allMovies;
  }

  async getMovieById(id: number): Promise<WholeMovieReturnDto> {
    let theMovie =  await this.moviesRepository.findOne({ where: { id: id },
      relations:["genres"] });
    
    if(!theMovie){
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }
    return theMovie;
  }

  async getMovies(
    filter: MovieFilterDto,
    pagination: PaginationDto
  ) {
    const { title,voteAverage, releaseDate,genreId } = filter;
    
    let validatedPagination = await this.validatePagination(pagination.page,pagination.limit);
    const { page, limit } = validatedPagination;

    if(!title && !releaseDate && !voteAverage && !genreId){
      let cache:any = await this.cacheManager.get('theMovies');
      if(cache){
        let theMovies:any[] = cache.data;
        let totalMoviesLength = theMovies.length;
        theMovies = this.paginateCachedArray(theMovies,page,limit);
        return {
          data: theMovies,
          totalMoviesLength,
          page,
          limit,
          totalPages: Math.ceil(totalMoviesLength / limit),
        };
      }else{
        let dbMovies =  await this.moviesRepository.find({ relations: ['genres'] });
        let totalMoviesLength = dbMovies.length;
        await this.cacheManager.set('theMovies', { data: dbMovies});
        dbMovies = this.paginateCachedArray(dbMovies,page,limit);
        return {
          data: dbMovies,
          totalMoviesLength,
          page,
          limit,
          totalPages: Math.ceil(totalMoviesLength / limit),
        };
      }
    }else{
      const queryOptions: any = {
        where: {},
        take: limit,
        skip: (page - 1) * limit,
        relations: ['genres']
      };

      if (title) {
        queryOptions.where.title = Like(`%${title}%`);
      }
      if (releaseDate) {
        queryOptions.where.releaseDate = LessThanOrEqual(releaseDate);
      }
      if (voteAverage) {
        queryOptions.where.voteAverage = MoreThan(voteAverage);
      }
      if (genreId) {
        queryOptions.where.genres = { id: genreId };
      }

      // Execute query with pagination and return both data and total count
      const [movies, total] = await this.moviesRepository.findAndCount(queryOptions);

      return {
        data: movies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  async rateMovie(movieId: number, ratingNumber: number): Promise<Partial<MovieEntity>> {
    const movie = await this.moviesRepository.findOneBy({ id: movieId });
    if (!movie) {
      throw new Error('Movie not found');
    }

    movie.voteCount += 1;
    //calculate new average
    movie.voteAverage = (Number(movie.voteAverage) * (movie.voteCount - 1)
      + Number(ratingNumber)) / movie.voteCount;

    movie.voteAverage = Math.round(movie.voteAverage * 1000) / 1000;

    return this.moviesRepository.save(movie);
  }

  async favoriteMovie(userId: number, movieId: number): Promise<Partial<UserEntity>> {

    const user = await this.userService.findWithMovies(userId);
    
    const movie = await this.moviesRepository.findOne({ where: { id: movieId } });

    // Check if the user or movie exists
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // Add the movie to the user's favorites
    user.movies.push(movie);

    await this.userService.save(user);
    return this.userService.findWithMovies(userId);
  }

  async unfavoriteMovie(userId: number, movieId: number): Promise<Partial<UserEntity>> {
    // Find the user with their favorite movies
    const user = await this.userService.findWithMovies(userId);

    const movie = await this.moviesRepository.findOne({ where: { id: movieId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // Check if the movie is in the user's favorites
    const movieIndex = user.movies.findIndex((movie) => movie.id === Number(movieId));
    
    if (movieIndex === -1) {
      throw new NotFoundException('Movie is not in the user’s favorites');
    }

    // Remove the movie from the favorites
    user.movies.splice(movieIndex, 1);

    // Save the updated user
    await this.userService.save(user);
    return this.userService.findWithMovies(userId);
  }

  async getMyFavorites(userId: number): Promise<Partial<MovieEntity[]>> {
    const user = await this.userService.findWithMovies(userId);
    return user.movies;
  }

  private async populateGenre(): Promise<any> {
    let genreApiUrl = this.configService.getOrThrow('TMDB_API_GENRE_URL');
    let apiKey = this.configService.getOrThrow('TMDB_API_KEY');

    // delete saved genres
    await this.genreRepository.delete({});

    try {
      const response = await axios.get(genreApiUrl, {
        params: {
          api_key:apiKey
        },
      });

      let genres = response.data.genres;
      
      await this.genreRepository.save(genres);
    } catch (error) {
      console.log(error);
      
      throw new HttpException('Error fetching popular genres', HttpStatus.INTERNAL_SERVER_ERROR);
    }    
    return true
  }

  //validate pagination
  private async validatePagination(page:number,limit:number) {
    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 20;
    }
    if (page < 1 || limit < 1) {
      throw new HttpException('Invalid pagination parameters', HttpStatus.BAD_REQUEST);
    }
    return { page, limit };
  }

  private paginateCachedArray(array:any[], page:number, limit:number):any[] {
    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 20;
    }

    if (page < 1 || limit < 1) {
      throw new HttpException('Invalid pagination parameters', HttpStatus.BAD_REQUEST);
    }
  
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
  
    return array.slice(startIndex, endIndex);
  }
}

