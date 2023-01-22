import { Body, Controller, Patch } from "@nestjs/common";
import { ProgramService } from "./program/program.service";

@Controller()
export class AppController {
  constructor(private programService: ProgramService) {}

  @Patch()
  async update(@Body() joypadButton: any) {
    return this.programService.executeManually(joypadButton.joypadButton);
  }
}
