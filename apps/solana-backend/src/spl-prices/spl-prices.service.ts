import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Liquidity, Percent } from "@raydium-io/raydium-sdk";
import * as anchor from "@project-serum/anchor";
import { PROGRAM_ID } from "common";
import {
  FRONK_CURRENCY,
  FRONK_POOL_KEY,
  ONE_LAMPORT_OF_SOL,
} from "./constants";
import { AnchorService } from "../anchor/anchor.service";

@Injectable()
export class SplPricesService {
  private readonly logger = new Logger(SplPricesService.name);

  constructor(private readonly anchorService: AnchorService) {}

  async initSplPrices() {
    if (process.env.NODE_ENV === "development") {
      const nonHumanReadableMaxAmountIn =
        await this.getNonHumanReadableMaxAmountIn();

      this.logger.log("Max amount in: " + nonHumanReadableMaxAmountIn);

      const [splPricesPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("spl_prices"), FRONK_POOL_KEY.baseMint.toBuffer()],
        new anchor.web3.PublicKey(PROGRAM_ID),
      );
      const [programDataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
        [new anchor.web3.PublicKey(PROGRAM_ID).toBuffer()],
        new anchor.web3.PublicKey(
          "BPFLoaderUpgradeab1e11111111111111111111111",
        ),
      );
      const txid = await this.anchorService.program.methods
        .initializeSplPrices(
          FRONK_POOL_KEY.baseMint,
          nonHumanReadableMaxAmountIn,
        )
        .accounts({
          splPrices: splPricesPda,
          program: this.anchorService.program.programId,
          programData: programDataAddress,
        })
        .rpc();

      return txid;
    } else {
      throw new HttpException(
        "Endpoint only works in dev environment",
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Cron("0 */10 * * * *	")
  async updateSplPrices() {
    this.logger.log("Updating SPL prices...");

    const nonHumanReadableMaxAmountIn =
      await this.getNonHumanReadableMaxAmountIn();

    this.logger.log(
      `Max amount in (${FRONK_POOL_KEY.baseMint.toBase58()}): ${nonHumanReadableMaxAmountIn}`,
    );

    const [splPricesPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("spl_prices"), FRONK_POOL_KEY.baseMint.toBuffer()],
      new anchor.web3.PublicKey(PROGRAM_ID),
    );
    const [programDataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [new anchor.web3.PublicKey(PROGRAM_ID).toBuffer()],
      new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"),
    );

    try {
      await this.anchorService.program.methods
        .updateSplPrices(FRONK_POOL_KEY.baseMint, nonHumanReadableMaxAmountIn)
        .accounts({
          splPrices: splPricesPda,
          program: this.anchorService.program.programId,
          programData: programDataAddress,
        })
        .rpc();
    } catch (e) {
      this.logger.error(FRONK_POOL_KEY.baseMint.toBase58(), e);
      console.log(e);
    }

    this.logger.log("Done updating SPL prices!");
  }

  private async getNonHumanReadableMaxAmountIn() {
    const poolInfo = await Liquidity.fetchInfo({
      connection: this.anchorService.connection,
      poolKeys: FRONK_POOL_KEY,
    });

    const maxAmountIn = Liquidity.computeAmountIn({
      amountOut: ONE_LAMPORT_OF_SOL,
      currencyIn: FRONK_CURRENCY,
      poolInfo,
      poolKeys: FRONK_POOL_KEY,
      slippage: new Percent(1, 100), // 1%
    }).maxAmountIn;

    return maxAmountIn.raw;
  }
}
