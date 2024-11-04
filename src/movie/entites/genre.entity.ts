import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { MovieEntity } from './movies.entity';

@Entity({ name: 'genres' })
export class GenreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => MovieEntity, (movie) => movie.genres)
  movies: MovieEntity[];
}
