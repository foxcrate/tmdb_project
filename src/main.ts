import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    // whitelist: true,
    // forbidNonWhitelisted: true
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TMDB API Documentation')
    .addBearerAuth()
    .setVersion('1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      plugins: [
        (...args: any[]) => (window as any).HierarchicalTagsPlugin(...args),
        // This is added by nestjs by default and would be overridden if not included
        (...args: any[]) =>
          (window as any).SwaggerUIBundle.plugins.DownloadUrl(...args),
      ],
      hierarchicalTagSeparator: ':', // This must be a string, as RegExp will not survive being json encoded
    },
    customJs: ['https://unpkg.com/swagger-ui-plugin-hierarchical-tags'],
  });
  //

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
