import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { WasmboyService } from "./wasmboy/wasmboy.service";
import { ProgramService } from "./program/program.service";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [WasmboyService, ProgramService],
})
export class AppModule {}
