import { Body, Controller, Patch, Post } from "@nestjs/common";
import { ProgramService } from "./program/program.service";
import { SplPricesService } from "./spl-prices/spl-prices.service";
import { WasmboyService } from "./wasmboy/wasmboy.service";

@Controller()
export class AppController {
  constructor(
    private programService: ProgramService,
    private wasmboyService: WasmboyService,
    private splPricesService: SplPricesService,
  ) {}

  @Post()
  async uploadInitialCids(@Body() body: { romName: string }) {
    return this.wasmboyService.generateInitialCids(body.romName);
  }

  @Patch()
  async update(@Body() body: { gameData: string }) {
    return this.programService.executeManually(body.gameData);
  }

  @Post("prices")
  async initSplPrices() {
    return this.splPricesService.initSplPrices();
  }
}
