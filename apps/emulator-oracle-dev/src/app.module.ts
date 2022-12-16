import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { WasmboyModule } from "./wasmboy/wasmboy.module";
import { wasmboyProvider } from "./wasmboy/wasmboy.provider";

@Module({
  imports: [WasmboyModule],
  controllers: [AppController],
  providers: [wasmboyProvider],
})
export class AppModule {}
