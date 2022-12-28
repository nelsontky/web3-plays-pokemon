import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { WasmboyModule } from "./wasmboy/wasmboy.module";
import { WasmboyService } from "./wasmboy/wasmboy.service";

@Module({
  imports: [WasmboyModule],
  controllers: [AppController],
  providers: [WasmboyService],
})
export class AppModule {}
