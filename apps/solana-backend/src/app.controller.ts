import { Controller, Patch, Post } from "@nestjs/common";
import * as pako from "pako";
import { IpfsService } from "./ipfs/ipfs.service";
import { ProgramService } from "./program/program.service";

@Controller()
export class AppController {
  constructor(
    private programService: ProgramService,
    private ipfsService: IpfsService,
  ) {}

  @Patch()
  async update() {
    return this.programService.executeManually();
  }

  @Post()
  async testIpfs() {
    const testCid =
      "bafkreigta3nr75v35u3vpod5pbye5yslgkafxxamhiaiffd6elfbkdw4by";
    const response = await this.ipfsService.download(testCid);
    const inflated = pako.inflate(response, { to: "string" });
    const saveState = JSON.parse(inflated);
    console.log("saveState:", saveState);

    const compressedSaveState = pako.deflate(JSON.stringify(saveState));
    const cid = await this.ipfsService.upload(compressedSaveState);
    const response1 = await this.ipfsService.download(cid);
    const inflated1 = pako.inflate(response1, { to: "string" });
    const saveState1 = JSON.parse(inflated1);
    console.log("saveState1:", saveState1);
  }
}
