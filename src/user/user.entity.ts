import { MovieEntity } from 'src/movie/movies.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => MovieEntity, (movie) => movie.users)
  movies: MovieEntity[];
}
