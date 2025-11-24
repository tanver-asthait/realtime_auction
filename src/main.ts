import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular dev server
      'http://localhost:3000', // Alternative frontend
      process.env.FRONTEND_URL, // Production frontend URL
      'https://your-frontend-app.onrender.com', // Replace with actual Render frontend URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0'; // Bind to all interfaces on Windows
  
  try {
    await app.listen(port, host);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Server is listening on: ${host}:${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
bootstrap();
