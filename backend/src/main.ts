import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('frontend.url'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Google-Token',
      'X-Facebook-Token',
      'X-Facebook-Page-Token',
    ],
  });

  // Configure session
  app.use(
    session({
      secret:
        configService.get<string>('session.secret') || 'default-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
