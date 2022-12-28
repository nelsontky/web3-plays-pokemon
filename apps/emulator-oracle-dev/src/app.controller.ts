import { Controller, Inject, Patch } from "@nestjs/common";
import { WasmboyService } from "./wasmboy/wasmboy.service";

@Controller()
export class AppController {
  constructor(private wasmboyService: WasmboyService) {}

  @Patch()
  async update() {
    return this.wasmboyService.executeFrames(60);
  }
}
