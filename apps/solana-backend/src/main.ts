import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ProgramService } from "./program/program.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  app.enableCors();
  await app.listen(5000);

  // start listener
  const programService = app.get(ProgramService);
  programService.listen();
}
bootstrap();
