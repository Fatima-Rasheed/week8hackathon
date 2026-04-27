import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://hackathonweek8.vercel.app',
        'https://hackathonweek8-1u30n9jb6-fatima-rasheeds-projects.vercel.app',
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      const isAllowedExact = allowedOrigins.includes(origin);
      const isVercelPreview = /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isAllowedExact || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`CORS policy blocked origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();