import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { WasmboyService } from "./wasmboy/wasmboy.service";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ProgramService } from "./program/program.service";
import { IpfsService } from "./ipfs/ipfs.service";
import { RealtimeDatabaseService } from "./realtime-database/realtime-database.service";
import { SplPricesService } from "./spl-prices/spl-prices.service";
import { AnchorService } from "./anchor/anchor.service";

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    WasmboyService,
    ProgramService,
    IpfsService,
    RealtimeDatabaseService,
    SplPricesService,
    AnchorService,
  ],
})
export class AppModule {}
