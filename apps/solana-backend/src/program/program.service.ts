import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";
import * as anchor from "@project-serum/anchor";
import { GAME_DATA_ACCOUNT_ID, JoypadButton, PROGRAM_ID } from "common";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import { WasmboyService } from "src/wasmboy/wasmboy.service";

// nestjs doesn't want to play nice with json imports from workspace package
import * as idl from "../../../../packages/solana-plays-pokemon-program/target/idl/solana_plays_pokemon_program.json";

@Injectable()
export class ProgramService implements OnModuleDestroy {
  private readonly logger = new Logger(ProgramService.name);
  private connection: anchor.web3.Connection;
  private program: anchor.Program<SolanaPlaysPokemonProgram>;
  private wallet: anchor.Wallet;
  private listener: number;

  constructor(private readonly wasmboyService: WasmboyService) {
    this.connection = new anchor.web3.Connection(
      "https://silent-side-firefly.solana-devnet.discover.quiknode.pro/71ad7ea43222277835b53cd7a66efe522cb201f3/",
      {
        wsEndpoint:
          "wss://silent-side-firefly.solana-devnet.discover.quiknode.pro/71ad7ea43222277835b53cd7a66efe522cb201f3/",
      },
    );

    const keypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY)),
    );
    this.wallet = {
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

    const provider = new anchor.AnchorProvider(this.connection, this.wallet, {
      commitment: "processed",
      skipPreflight: true,
    });
    this.program = new anchor.Program(
      idl as anchor.Idl,
      PROGRAM_ID,
      provider,
    ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;
  }

  async onModuleDestroy() {
    if (typeof this.listener === "number") {
      await this.program.removeEventListener(this.listener);
      this.logger.log("Listener removed");
    }
  }

  listen() {
    const RETRIES = 10;
    this.listener = this.program.addEventListener(
      "ExecuteGameState",
      async (event) => {
        this.logger.log(
          "Executing game state with event: " + JSON.stringify(event),
        );
        for (let i = 0; i < RETRIES; i++) {
          try {
            const gameDataId: anchor.web3.PublicKey = event.gameDataId;
            if (gameDataId.toBase58() !== GAME_DATA_ACCOUNT_ID) {
              this.logger.warn(
                "Invalid game_data_id passed to ExecuteGameState. Event will be ignored",
              );
              return;
            }

            const secondsPlayed: number = event.second;
            await this.executeGameState(secondsPlayed);

            this.logger.log("Execution success");
            return;
          } catch (e) {
            // retry upon error
            this.logger.error("Error occurred:", e);
            await new Promise((resolve) => {
              setTimeout(resolve, 1000);
            });
            this.logger.error(`(${i + 1} / ${RETRIES}) Retrying...`);
          }
        }
      },
    );
    this.logger.log("Listener added");
  }

  async executeManually() {
    const gameDataId = new anchor.web3.PublicKey(GAME_DATA_ACCOUNT_ID);
    const gameData = await this.program.account.gameData.fetch(gameDataId);

    if (!gameData.isExecuting) {
      this.logger.warn("Game is not executing");
      throw new HttpException(
        "Game is not executing",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.executeGameState(gameData.secondsPlayed);
  }

  private async executeGameState(secondsPlayed: number) {
    const gameDataId = new anchor.web3.PublicKey(GAME_DATA_ACCOUNT_ID);
    const [currentGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameDataId.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + secondsPlayed),
      ],
      this.program.programId,
    );
    const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameDataId.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      this.program.programId,
    );
    const [prevGameState, currentGameState] = await Promise.all([
      this.program.account.gameState.fetch(prevGameStatePda),
      this.program.account.gameState.fetch(currentGameStatePda),
    ]);

    const joypadButton = this.computeButtonVotes(currentGameState);
    const { framesImageDataCid, saveStateCid } = await this.wasmboyService.run(
      joypadButton,
      prevGameState.saveStateCid,
    );

    const instruction = await this.program.methods
      .updateGameState(secondsPlayed, framesImageDataCid, saveStateCid)
      .accounts({
        authority: this.wallet.publicKey,
        gameData: gameDataId,
        gameState: currentGameStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([this.wallet.payer])
      .instruction();
    const transaction = new anchor.web3.Transaction().add(instruction);

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    await anchor.web3.sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet.payer],
      {
        commitment: "processed",
      },
    );
  }

  private computeButtonVotes(currentGameState: any) {
    const {
      upCount,
      downCount,
      leftCount,
      rightCount,
      aCount,
      bCount,
      startCount,
      selectCount,
      nothingCount,
    } = currentGameState;
    const maxCount = Math.max(
      upCount,
      downCount,
      leftCount,
      rightCount,
      aCount,
      bCount,
      startCount,
      selectCount,
      nothingCount,
    );
    let joypadButton: JoypadButton;
    switch (maxCount) {
      case upCount:
        joypadButton = JoypadButton.Up;
        break;
      case downCount:
        joypadButton = JoypadButton.Down;
        break;
      case leftCount:
        joypadButton = JoypadButton.Left;
        break;
      case rightCount:
        joypadButton = JoypadButton.Right;
        break;
      case aCount:
        joypadButton = JoypadButton.A;
        break;
      case bCount:
        joypadButton = JoypadButton.B;
        break;
      case startCount:
        joypadButton = JoypadButton.Start;
        break;
      case selectCount:
        joypadButton = JoypadButton.Select;
        break;
      default:
        joypadButton = JoypadButton.Nothing;
    }

    return joypadButton;
  }
}