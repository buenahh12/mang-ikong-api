import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Checks every request body against its DTO rules (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes fields that aren't in the DTO
      forbidNonWhitelisted: true, // ...and returns 400 if extra fields are sent
      transform: true, // turns the JSON body into the DTO class
    }),
  );

  // Lets a browser frontend (e.g. React) call this API
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
