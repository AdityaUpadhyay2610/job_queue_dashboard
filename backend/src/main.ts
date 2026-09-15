import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Application entrypoint configuring CORS, DTO validation pipes, and starting the HTTP server
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend can communicate with the backend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global validation pipe for request body DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Listen on process.env.PORT (required for Render/Railway/Heroku) or default to 3000
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 Backend is running on http://localhost:${PORT}`);
}
bootstrap();
