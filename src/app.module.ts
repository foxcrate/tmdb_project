import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmDbConfig } from 'ormconfig';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';  
import { redisStore } from 'cache-manager-redis-yet'; 

@Module({
  imports: [
    CacheModule.registerAsync({  
      isGlobal: true,  
      useFactory: async () => ({  
        store: await redisStore({  
          socket: {  
            host: 'localhost',  
            port: 6379,  
          },        
        }),      
      }),    
    }),
    MovieModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmDbConfig),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
