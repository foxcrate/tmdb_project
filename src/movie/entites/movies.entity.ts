import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { GenreEntity } from './genre.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'movies' })
export class MovieEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'longtext' })
  overview: string;

  @Column({ type: 'bigint' })
  theMoviesDbId: number;

  @Column({nullable: true})
  releaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 3})
  voteAverage: number;

  @Column()
  voteCount: number;

  @ManyToMany(() => GenreEntity, (genre) => genre.movies, { cascade: true })
  @JoinTable({ name: 'movies_genres' })
  genres: GenreEntity[];

  @ManyToMany(() => UserEntity, (user) => user.movies)
  @JoinTable({ name: 'movies_users' })
  users: UserEntity[];
}
