import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import {
  Currency,
  CurrencyAmount,
  Liquidity,
  Percent,
} from "@raydium-io/raydium-sdk";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
// nestjs doesn't want to play nice with json imports from workspace package
import * as idl from "../../../../packages/solana-plays-pokemon-program/target/idl/solana_plays_pokemon_program.json";
import * as anchor from "@project-serum/anchor";
import { PROGRAM_ID } from "common";
import {
  FRONK_CURRENCY,
  FRONK_POOL_KEY,
  ONE_LAMPORT_OF_SOL,
} from "./constants";

@Injectable()
export class SplPricesService {
  private readonly logger = new Logger(SplPricesService.name);
  private readonly connection: anchor.web3.Connection;
  private readonly program: anchor.Program<SolanaPlaysPokemonProgram>;

  constructor() {
    // TODO: create separate service to combine this init steps with program.service
    this.connection = new anchor.web3.Connection(
      process.env.RPC_URL,
      process.env.RPC_CONFIG ? JSON.parse(process.env.RPC_CONFIG) : undefined,
    );

    const keypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY)),
    );
    const wallet = {
      publicKey: keypair.publicKey,
      payer: keypair,
      signTransaction: (tx: anchor.web3.Transaction) => {
        tx.sign(keypair);
        return Promise.resolve(tx);
      },
      signAllTransactions: (txs: anchor.web3.Transaction[]) => {
        txs.forEach((tx) => {
          tx.sign(keypair);
        });

        return Promise.resolve(txs);
      },
    };

    const provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: "processed",
    });
    this.program = new anchor.Program(
      idl as anchor.Idl,
      PROGRAM_ID,
      provider,
    ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;
  }

  @Cron("0 */10 * * * *	")
  async updateSplPrices() {
    const maxAmountIn = await this.getMaxAmountIn();

    const [splPricesPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("spl_prices"), FRONK_POOL_KEY.baseMint.toBuffer()],
      new anchor.web3.PublicKey(PROGRAM_ID),
    );
    const [programDataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [new anchor.web3.PublicKey(PROGRAM_ID).toBuffer()],
      new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"),
    );
    try {
      await this.program.methods
        .updateSplPrices(FRONK_POOL_KEY.baseMint, maxAmountIn)
        .accounts({
          splPrices: splPricesPda,
          program: this.program.programId,
          programData: programDataAddress,
        })
        .rpc();
    } catch (e) {
      this.logger.error(FRONK_POOL_KEY.baseMint.toBase58(), e);
      console.log(e);
    }
  }

  private async getMaxAmountIn() {
    const poolInfo = await Liquidity.fetchInfo({
      connection: this.connection,
      poolKeys: FRONK_POOL_KEY,
    });

    const maxAmountIn = Liquidity.computeAmountIn({
      amountOut: ONE_LAMPORT_OF_SOL,
      currencyIn: FRONK_CURRENCY,
      poolInfo,
      poolKeys: FRONK_POOL_KEY,
      slippage: new Percent(1, 100), // 1%
    }).maxAmountIn;

    return maxAmountIn.raw.toNumber();
  }
}
