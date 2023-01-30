import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
} from "@nestjs/common";
import * as anchor from "@project-serum/anchor";
import {
  BUTTON_ID_TO_ENUM,
  JoypadButton,
  GAME_DATAS,
  GAME_DATA_ROM_NAME,
} from "common";
import { WasmboyService } from "../wasmboy/wasmboy.service";
import { Cron } from "@nestjs/schedule";
import { RealtimeDatabaseService } from "../realtime-database/realtime-database.service";
import { AnchorService } from "../anchor/anchor.service";

@Injectable()
export class ProgramService implements OnModuleDestroy {
  private readonly logger = new Logger(ProgramService.name);
  private listeners: number[];

  constructor(
    private readonly wasmboyService: WasmboyService,
    private readonly anchorService: AnchorService,
    private readonly realtimeDatabaseService: RealtimeDatabaseService,
  ) {
    this.listeners = [];
  }

  async onModuleDestroy() {
    for (const listener of this.listeners) {
      await this.anchorService.program.removeEventListener(listener);
    }

    this.logger.log("All listeners removed");
  }

  listen() {
    const gameDatas = Object.keys(GAME_DATAS);
    for (const gameData of gameDatas) {
      const listener = this.anchorService.program.addEventListener(
        "ExecuteGameState",
        async (event) => {
          this.logger.log(
            `Executing game state for gameData "${gameData}" with event: ` +
              JSON.stringify(event),
          );
          try {
            const gameDataId: anchor.web3.PublicKey = event.gameDataId;
            if (!GAME_DATAS[gameDataId.toBase58()]) {
              this.logger.warn(
                "Invalid game_data_id passed to ExecuteGameState. Event will be ignored",
              );
              return;
            }
            const buttonPresses: number[] = event.buttonPresses;
            const gameStateIndex: number = event.index;
            const participants: string[] = event.participants
              .filter(
                (participant: anchor.web3.PublicKey) =>
                  participant.toBase58() !== "11111111111111111111111111111111",
              )
              .map((participant: anchor.web3.PublicKey) =>
                participant.toBase58(),
              );
            await this.executeGameState(
              gameDataId,
              gameStateIndex,
              buttonPresses,
              participants,
            );
            this.logger.log("Execution success");
            return;
          } catch (e) {
            this.logger.error("Listen execution error occurred:", e);
          }
        },
      );

      this.listeners.push(listener);
      this.logger.log(`Listener added for "${gameData}"`);
    }
  }

  async executeManually(gameData: string) {
    const gameDataId = new anchor.web3.PublicKey(gameData);
    const gameDataAccount =
      await this.anchorService.program.account.gameData.fetch(gameDataId);

    if (!gameDataAccount.isExecuting) {
      this.logger.warn("Game is not executing");
      throw new HttpException(
        "Game is not executing",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.executeGameState(
      gameDataId,
      gameDataAccount.executedStatesCount,
    );
  }

  @Cron(`*/20 * * * * *`)
  async cronExecute() {
    const gameDatas = Object.keys(GAME_DATAS);
    for (const gameData of gameDatas) {
      const gameDataId = new anchor.web3.PublicKey(gameData);
      const gameDataAccount =
        await this.anchorService.program.account.gameData.fetch(gameDataId);

      if (gameDataAccount.isExecuting) {
        this.logger.log(
          `Cron job executing for game data "${gameData}" index "${gameDataAccount.executedStatesCount}"`,
        );
        try {
          await this.executeGameState(
            gameDataId,
            gameDataAccount.executedStatesCount,
          );
          this.logger.log("Cron job executed successfully!");
        } catch (e) {
          this.logger.warn(`Cron job failed: ${e}`);
        }
      }
    }
  }

  private async executeGameState(
    gameDataId: anchor.web3.PublicKey,
    gameStateIndex: number,
    eventButtonPresses?: number[],
    currentParticipants?: string[],
  ) {
    if (!GAME_DATAS[gameDataId.toBase58()]) {
      this.logger.warn(
        "Invalid game_data_id passed to executeGameState method. Event will be ignored",
      );
      return;
    }

    const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameDataId.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (gameStateIndex - 1)),
      ],
      this.anchorService.program.programId,
    );
    const [currentGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameDataId.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + gameStateIndex),
      ],
      this.anchorService.program.programId,
    );
    const [nextGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameDataId.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (gameStateIndex + 1)),
      ],
      this.anchorService.program.programId,
    );
    const [currentParticipantsPda] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("current_participants"), gameDataId.toBuffer()],
        this.anchorService.program.programId,
      );

    const prevGameState =
      await this.anchorService.program.account.gameStateV4.fetch(
        prevGameStatePda,
      );

    let buttonPresses: JoypadButton[];
    if (eventButtonPresses === undefined) {
      const currentGameState =
        await this.anchorService.program.account.gameStateV4.fetch(
          currentGameStatePda,
        );
      buttonPresses = Array.from(currentGameState.buttonPresses).map(
        (id) => BUTTON_ID_TO_ENUM[id],
      );
    } else {
      buttonPresses = eventButtonPresses.map((id) => BUTTON_ID_TO_ENUM[id]);
    }

    const romName = GAME_DATA_ROM_NAME[gameDataId.toBase58()];
    const { framesImageDataCid, saveStateCid } = await this.wasmboyService.run(
      romName,
      buttonPresses,
      prevGameState.saveStateCid,
    );

    // compile participants before they are deleted by the next transaction
    let participants: string[];
    if (currentParticipants === undefined) {
      const currentParticipants =
        await this.anchorService.program.account.currentParticipants.fetch(
          currentParticipantsPda,
        );
      participants = currentParticipants.participants
        .filter(
          (participant) =>
            participant.toBase58() !== "11111111111111111111111111111111",
        )
        .map((participant) => participant.toBase58());
    } else {
      participants = currentParticipants;
    }

    const instruction = await this.anchorService.program.methods
      .updateGameState(framesImageDataCid, saveStateCid)
      .accounts({
        authority: this.anchorService.wallet.publicKey,
        gameData: gameDataId,
        gameState: currentGameStatePda,
        nextGameState: nextGameStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        currentParticipants: currentParticipantsPda,
      })
      .signers([this.anchorService.wallet.payer])
      .instruction();
    const transaction = new anchor.web3.Transaction().add(instruction);

    const { blockhash, lastValidBlockHeight } =
      await this.anchorService.connection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    await anchor.web3.sendAndConfirmTransaction(
      this.anchorService.connection,
      transaction,
      [this.anchorService.wallet.payer],
      {
        commitment: "processed",
      },
    );

    // save participants to firebase
    for (const participant of participants) {
      await this.realtimeDatabaseService.set(
        `participants-${gameDataId.toBase58()}/${participant}`,
        gameStateIndex,
      );
    }
  }
}
