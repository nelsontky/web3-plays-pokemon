import { Body, Controller, Inject, Patch } from "@nestjs/common";
import { UpdateWasmboyDto } from "./wasmboy/dto/update-wasmboy.dto";
import { WasmboyService } from "./wasmboy/wasmboy.service";

@Controller()
export class AppController {
  constructor(private wasmboyService: WasmboyService) {}

  @Patch()
  async update(@Body() updateWasmboyDto: UpdateWasmboyDto) {
    return this.wasmboyService.executeFrames(60, updateWasmboyDto.joypadButton);
  }
}
