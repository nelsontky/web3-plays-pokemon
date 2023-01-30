import { Injectable, Logger } from "@nestjs/common";
import { NFTStorage, Blob } from "nft.storage";
import { Web3Storage } from "web3.storage";
import axios from "axios";
import { FsBlockStore } from "ipfs-car/blockstore/fs";
import { Cron } from "@nestjs/schedule";
import * as IPFS from "ipfs-http-client";

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly client: any;
  private pinningProvider: "web3.storage" | "nft.storage";

  constructor() {
    this.pinningProvider = "nft.storage";
    this.client = IPFS();
  }

  async upload(data: Uint8Array) {
    if (process.env.NODE_ENV === "development") {
      return this.uploadToPinningService(data);
    }

    try {
      const { cid } = await this.client.add(data, {
        cidVersion: 1,
      });

      return cid.toString();
    } catch (e) {
      this.logger.error(
        "Something is wrong with ipfs node, please restart ipfs service! Using external pinning service now...",
      );
      return this.uploadToPinningService(data);
    }
  }

  async download(cid: string) {
    const abortControllers = [new AbortController(), new AbortController()];
    const response = await Promise.any([
      axios.get(`http://localhost:8080/ipfs/${cid}`, {
        responseType: "arraybuffer",
        signal: abortControllers[0].signal,
      }),
      axios.get(`https://${cid}.ipfs.cf-ipfs.com`, {
        responseType: "arraybuffer",
        signal: abortControllers[1].signal,
      }),
    ]);
    abortControllers.map((controller) => {
      controller.abort();
    });

    return response.data;
  }

  @Cron("0 */10 * * * *")
  revertToNftStorage() {
    if (this.pinningProvider !== "nft.storage") {
      this.logger.log(
        "Automatically switching ipfs service back to nft.storage",
      );
      this.pinningProvider = "nft.storage";
    }
  }

  private async uploadToPinningService(data: Uint8Array) {
    let cid: string | undefined = undefined;

    while (cid === undefined) {
      if (this.pinningProvider === "nft.storage") {
        try {
          cid = await this.uploadToNftStorage(data);
          // this.logger.log(
          //   `Pinned ${cid} successfully on ${this.pinningProvider}`,
          // );
          return cid;
        } catch (e) {
          this.pinningProvider = "web3.storage";
          this.logger.warn(
            `nft.storage error for cid ${cid}. Trying web3.storage on next run.`,
          );
        }
      } else {
        try {
          cid = await this.uploadToWeb3Storage(data);
          // this.logger.log(
          //   `Pinned ${cid} successfully on ${this.pinningProvider}`,
          // );
          return cid;
        } catch (e) {
          this.pinningProvider = "nft.storage";
          this.logger.warn(
            `web3.storage error for cid ${cid}. Trying nft.storage on next run.`,
          );
        }
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    }
  }

  private async uploadToNftStorage(data: Uint8Array) {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });
    const cid = await client.storeBlob(new Blob([data]));
    return cid.toString();
  }

  private async uploadToWeb3Storage(data: Uint8Array) {
    const blockstore = new FsBlockStore();

    try {
      const { car } = await NFTStorage.encodeBlob(new Blob([data]), {
        blockstore,
      });

      const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
      const cid = await client.putCar(car);
      return cid.toString();
    } finally {
      await blockstore.close();
    }
  }
}
