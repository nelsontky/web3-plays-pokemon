import { Body, Controller, Patch, StreamableFile } from "@nestjs/common";
import { Readable } from "stream";
import { UpdateWasmboyDto } from "./wasmboy/dto/update-wasmboy.dto";
import { WasmboyService } from "./wasmboy/wasmboy.service";

@Controller()
export class AppController {
  constructor(private wasmboyService: WasmboyService) {}

  @Patch()
  async update(@Body() updateWasmboyDto: UpdateWasmboyDto) {
    const framesImageData = await this.wasmboyService.run(
      60,
      updateWasmboyDto.joypadButton,
    );

    const file = new Readable({
      read() {
        this.push(framesImageData);
        this.push(null);
      },
    });
    return new StreamableFile(file);
  }
}
