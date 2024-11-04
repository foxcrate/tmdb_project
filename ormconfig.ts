import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './src/user/user.entity';
import { MovieEntity } from './src/movie/movies.entity';
import { GenreEntity } from './src/movie/genre.entity';


ConfigModule.forRoot({
  isGlobal: true,
});

const configService = new ConfigService();

export const typeOrmDbConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: configService.getOrThrow('DB_HOST'),
  port: configService.getOrThrow('DB_PORT'),
  username: configService.getOrThrow('DB_USERNAME'),
  password: configService.getOrThrow('DB_PASSWORD'),
  database: configService.getOrThrow('DB_NAME'),
  synchronize: true,
  entities: [
    UserEntity,
    MovieEntity,
    GenreEntity
  ],
  poolSize: 10,
  // migrations: [__dirname + '/migrations/**/*'],
  // migrationsTableName: 'migrations',
};

export const typeOrmDataSource = new DataSource(
  typeOrmDbConfig as DataSourceOptions,
);
