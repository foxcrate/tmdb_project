import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { MovieEntity } from './movies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenreEntity } from './genre.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity,GenreEntity]),AuthModule,UserModule],
  providers: [MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
