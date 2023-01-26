import { Body, Controller, Patch, Post } from "@nestjs/common";
import { ProgramService } from "./program/program.service";
import { WasmboyService } from "./wasmboy/wasmboy.service";

@Controller()
export class AppController {
  constructor(
    private programService: ProgramService,
    private wasmboyService: WasmboyService,
  ) {}

  @Post()
  async uploadInitialCids(@Body() body: { romName: string }) {
    return this.wasmboyService.generateInitialCids(body.romName);
  }

  @Patch()
  async update() {
    return this.programService.executeManually();
  }
}
