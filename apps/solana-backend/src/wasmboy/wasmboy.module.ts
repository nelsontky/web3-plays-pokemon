import { Module } from "@nestjs/common";
import { WasmboyService } from "./wasmboy.service";

@Module({
  providers: [WasmboyService],
  exports: [WasmboyService],
})
export class WasmboyModule {}
