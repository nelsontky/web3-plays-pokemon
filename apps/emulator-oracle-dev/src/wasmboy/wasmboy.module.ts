import { Module } from "@nestjs/common";
import { wasmboyProvider } from "./wasmboy.provider";

@Module({
  providers: [wasmboyProvider],
  exports: [wasmboyProvider],
})
export class WasmboyModule {}
