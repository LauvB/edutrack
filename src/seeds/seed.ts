import { NestFactory } from '@nestjs/core';
import { SeedersModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedersModule);
  const seeder = app.get(SeedService);

  await seeder.runSeed();

  await app.close();
}
bootstrap();
