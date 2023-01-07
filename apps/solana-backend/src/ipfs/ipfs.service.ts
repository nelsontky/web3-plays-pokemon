import { Injectable, Logger } from "@nestjs/common";
import { NFTStorage, Blob } from "nft.storage";
import { Web3Storage } from "web3.storage";
import axios from "axios";
import { FsBlockStore } from "ipfs-car/blockstore/fs";

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private ipfsProvider: "web3.storage" | "nft.storage";

  constructor() {
    this.ipfsProvider = "nft.storage";
  }

  async upload(data: Uint8Array) {
    if (this.ipfsProvider === "nft.storage") {
      try {
        const cid = await this.uploadToNftStorage(data);
        return cid;
      } catch (e) {
        this.logger.warn(`nft.storage error: ${e}. Trying web3.storage now...`);
        this.ipfsProvider = "web3.storage";
      }
    }

    try {
      this.logger.log("Uploading via web3.storage...");
      const cid = await this.uploadToWeb3Storage(data);
      return cid;
    } catch (e) {
      this.ipfsProvider = "nft.storage";
      throw new Error(
        `web3.storage error: ${e}. Trying nft.storage on next run, fingers crossed...`,
      );
    }
  }

  async download(cid: string) {
    const response = await axios.get(`https://${cid}.ipfs.cf-ipfs.com`, {
      responseType: "arraybuffer",
    });

    return response.data;
  }

  private uploadToNftStorage(data: Uint8Array) {
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });
    return client.storeBlob(new Blob([data]));
  }

  private async uploadToWeb3Storage(data: Uint8Array) {
    const { car } = await NFTStorage.encodeBlob(new Blob([data]), {
      blockstore: new FsBlockStore(),
    });

    const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
    return client.putCar(car);
  }
}
