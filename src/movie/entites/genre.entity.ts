import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { MovieEntity } from './movies.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'genres' })
export class GenreEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ManyToMany(() => MovieEntity, (movie) => movie.genres)
  movies: MovieEntity[];
}
