import * as anchor from "@project-serum/anchor";
import { useEffect } from "react";
import AppButton from "../components/AppButton";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY, PROGRAM_PUBLIC_KEY } from "../constants";
import { useAppSelector } from "../hooks/redux";
import { useMutableProgram } from "../hooks/useProgram";

// Initial Game Freak screen
// const FRAMES_IMAGES_CID =
//   "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";
// const SAVE_STATE_CID =
//   "bafkreigta3nr75v35u3vpod5pbye5yslgkafxxamhiaiffd6elfbkdw4by";

const FRAMES_IMAGES_CID =
  "bafkreihzutmgwwlpn3vvhzipvxjb5ljwzhis4qq72pt4wg5kgomrs5q2gq";
const SAVE_STATE_CID =
  "bafkreigka5p7dseiqx7wvvhxt7eqasgiikxu4uodapz5gjx66zfscpuium";

let gameData: anchor.web3.Keypair | null = null;
try {
  gameData = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(/* game data key */)
  );
} catch {}

const NUMBER_OF_STATES_TO_LOAD = 2;

export default function Admin() {
  const program = useMutableProgram();

  const secondsPlayed = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );

  const oldGameStatesPdas = Array.from(
    { length: NUMBER_OF_STATES_TO_LOAD },
    (_, i) => {
      const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + (secondsPlayed - i)),
        ],
        PROGRAM_PUBLIC_KEY
      );
      return gameStatePda;
    }
  );

  useEffect(
    function printOldGameStates() {
      if (program) {
        program.account.gameStateV2
          .fetchMultiple(oldGameStatesPdas)
          .then((result) => {
            console.log(result);
          });
      }
    },
    [oldGameStatesPdas, program]
  );

  const migrateGameStates = async () => {
    if (program) {
      const [nextGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + (secondsPlayed + 1)),
        ],
        PROGRAM_PUBLIC_KEY
      );
      const [nextNextGameStatePda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
            Buffer.from("game_state"),
            Buffer.from("" + (secondsPlayed + 2)),
          ],
          PROGRAM_PUBLIC_KEY
        );
      console.log("sending");

      const FRAMES_IMAGES_CID =
        "bafkreifiqnnhhd7d63fm74i6lgchgsmwww4nm5gtmcvejqjryft7asnrgm";
      const SAVE_STATE_CID =
        "bafkreieubvbxq2l6duscnpiwfwqdrf6jixbuqoyn6b67lkekbpbqc66ghy";

      await program.methods
        .migrateGameStateToV3(FRAMES_IMAGES_CID, SAVE_STATE_CID)
        .accounts({
          gameData: GAME_DATA_ACCOUNT_PUBLIC_KEY,
          gameState: oldGameStatesPdas[0],
          nextGameState: nextGameStatePda,
          nextNextGameState: nextNextGameStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();
      console.log("sent");
    }
  };

  return (
    <div>
      <AppButton
        onClick={async () => {
          if (program && gameData) {
            const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
              [
                gameData.publicKey.toBuffer(),
                Buffer.from("game_state"),
                Buffer.from("0"),
              ],
              program.programId
            );
            const [nextGameStatePda] =
              anchor.web3.PublicKey.findProgramAddressSync(
                [
                  gameData.publicKey.toBuffer(),
                  Buffer.from("game_state"),
                  Buffer.from("1"),
                ],
                program.programId
              );
            console.log("sending");
            await program.methods
              .initialize(FRAMES_IMAGES_CID, SAVE_STATE_CID)
              .accounts({
                gameData: gameData.publicKey,
                gameState: gameStatePda,
                nextGameState: nextGameStatePda,
                systemProgram: anchor.web3.SystemProgram.programId,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              })
              .signers([gameData])
              .rpc();
            console.log("sent");
          }
        }}
      >
        Initialize accounts
      </AppButton>
      <AppButton onClick={migrateGameStates}>Migrate game state</AppButton>
    </div>
  );
}
