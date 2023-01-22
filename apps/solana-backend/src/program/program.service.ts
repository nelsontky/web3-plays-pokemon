import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";
import * as anchor from "@project-serum/anchor";
import {
  GAME_DATA_ACCOUNT_ID,
  PROGRAM_ID,
  BUTTON_ID_TO_ENUM,
  JoypadButton,
} from "common";
import { SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import { WasmboyService } from "src/wasmboy/wasmboy.service";
import { Cron } from "@nestjs/schedule";

// nestjs doesn't want to play nice with json imports from workspace package
import * as idl from "../../../../packages/solana-plays-pokemon-program/target/idl/solana_plays_pokemon_program.json";
import { RealtimeDatabaseService } from "../realtime-database/realtime-database.service";

@Injectable()
export class ProgramService implements OnModuleDestroy {
  private readonly logger = new Logger(ProgramService.name);
  private connection: anchor.web3.Connection;
  private program: anchor.Program<SolanaPlaysPokemonProgram>;
  private wallet: anchor.Wallet;
  private listener: number;

  constructor(
    private readonly wasmboyService: WasmboyService,
    private readonly realtimeDatabaseService: RealtimeDatabaseService,
  ) {
    this.connection = new anchor.web3.Connection(
      process.env.RPC_URL,
      process.env.RPC_CONFIG ? JSON.parse(process.env.RPC_CONFIG) : undefined,
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
    // this.listener = this.program.addEventListener(
    //   "ExecuteGameState",
    //   async (event) => {
    //     this.logger.log(
    //       "Executing game state with event: " + JSON.stringify(event),
    //     );
    //     try {
    //       const gameDataId: anchor.web3.PublicKey = event.gameDataId;
    //       if (gameDataId.toBase58() !== GAME_DATA_ACCOUNT_ID) {
    //         this.logger.warn(
    //           "Invalid game_data_id passed to ExecuteGameState. Event will be ignored",
    //         );
    //         return;
    //       }
    //       const buttonPresses: number[] = event.buttonPresses;
    //       const gameStateIndex: number = event.index;
    //       const participants: string[] = event.participants
    //         .filter(
    //           (participant: anchor.web3.PublicKey) =>
    //             participant.toBase58() !== "11111111111111111111111111111111",
    //         )
    //         .map((participant: anchor.web3.PublicKey) =>
    //           participant.toBase58(),
    //         );
    //       await this.executeGameState(
    //         gameStateIndex,
    //         buttonPresses,
    //         participants,
    //       );
    //       this.logger.log("Execution success");
    //       return;
    //     } catch (e) {
    //       this.logger.error("Listen execution error occurred:", e);
    //     }
    //   },
    // );
    // this.logger.log("Listener added");
  }

  async executeManually(joypadButton: JoypadButton) {
    const framesImageData = await this.wasmboyService.run(joypadButton);
    return framesImageData;
  }

  // @Cron(`*/20 * * * * *`)
  // async cronExecute() {
  //   const gameDataId = new anchor.web3.PublicKey(GAME_DATA_ACCOUNT_ID);
  //   const gameData = await this.program.account.gameData.fetch(gameDataId);

  //   if (!gameData.isExecuting) {
  //     return;
  //   }

  //   this.logger.log(
  //     `Cron job executing for index "${gameData.executedStatesCount}"`,
  //   );
  //   try {
  //     await this.executeGameState(gameData.executedStatesCount);
  //     this.logger.log("Cron job executed successfully!");
  //   } catch (e) {
  //     this.logger.warn(`Cron job failed: ${e}`);
  //   }
  // }

  // private async executeGameState(
  //   gameStateIndex: number,
  //   eventButtonPresses?: number[],
  //   currentParticipants?: string[],
  // ) {
  //   const gameDataId = new anchor.web3.PublicKey(GAME_DATA_ACCOUNT_ID);
  //   const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameDataId.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + (gameStateIndex - 1)),
  //     ],
  //     this.program.programId,
  //   );
  //   const [currentGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameDataId.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + gameStateIndex),
  //     ],
  //     this.program.programId,
  //   );
  //   const [nextGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameDataId.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + (gameStateIndex + 1)),
  //     ],
  //     this.program.programId,
  //   );
  //   const [currentParticipantsPda] =
  //     anchor.web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("current_participants"), gameDataId.toBuffer()],
  //       this.program.programId,
  //     );

  //   const prevGameState = await this.program.account.gameStateV4.fetch(
  //     prevGameStatePda,
  //   );

  //   let buttonPresses: JoypadButton[];
  //   if (eventButtonPresses === undefined) {
  //     const currentGameState = await this.program.account.gameStateV4.fetch(
  //       currentGameStatePda,
  //     );
  //     buttonPresses = Array.from(currentGameState.buttonPresses).map(
  //       (id) => BUTTON_ID_TO_ENUM[id],
  //     );
  //   } else {
  //     buttonPresses = eventButtonPresses.map((id) => BUTTON_ID_TO_ENUM[id]);
  //   }

  //   const { framesImageDataCid, saveStateCid } = await this.wasmboyService.run(
  //     buttonPresses,
  //     prevGameState.saveStateCid,
  //   );

  //   // compile participants before they are deleted by the next transaction
  //   let participants: string[];
  //   if (currentParticipants === undefined) {
  //     const currentParticipants =
  //       await this.program.account.currentParticipants.fetch(
  //         currentParticipantsPda,
  //       );
  //     participants = currentParticipants.participants
  //       .filter(
  //         (participant) =>
  //           participant.toBase58() !== "11111111111111111111111111111111",
  //       )
  //       .map((participant) => participant.toBase58());
  //   } else {
  //     participants = currentParticipants;
  //   }

  //   const instruction = await this.program.methods
  //     .updateGameState(framesImageDataCid, saveStateCid)
  //     .accounts({
  //       authority: this.wallet.publicKey,
  //       gameData: gameDataId,
  //       gameState: currentGameStatePda,
  //       nextGameState: nextGameStatePda,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //       currentParticipants: currentParticipantsPda,
  //     })
  //     .signers([this.wallet.payer])
  //     .instruction();
  //   const transaction = new anchor.web3.Transaction().add(instruction);

  //   const { blockhash, lastValidBlockHeight } =
  //     await this.connection.getLatestBlockhash();

  //   transaction.recentBlockhash = blockhash;
  //   transaction.lastValidBlockHeight = lastValidBlockHeight;

  //   await anchor.web3.sendAndConfirmTransaction(
  //     this.connection,
  //     transaction,
  //     [this.wallet.payer],
  //     {
  //       commitment: "processed",
  //     },
  //   );

  //   // save participants to firebase
  //   for (const participant of participants) {
  //     await this.realtimeDatabaseService.set(
  //       `${process.env.PARTICIPANTS_COLLECTION_NAME}/${participant}`,
  //       gameStateIndex,
  //     );
  //   }
  // }
}
