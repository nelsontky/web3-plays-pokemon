import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { WasmboyService } from "./wasmboy/wasmboy.service";
import { ProgramService } from "./program/program.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [WasmboyService, ProgramService],
})
export class AppModule {}
