import * as anchor from "@project-serum/anchor";
import { useEffect } from "react";
import AppButton from "ui/components/AppButton";
import { useAppSelector } from "ui/hooks/redux";
import { useMutableProgram } from "ui/hooks/useProgram";
import { PROGRAM_ID } from "common";
import { PublicKey } from "@solana/web3.js";
import { useConfig } from "ui/contexts/ConfigProvider";

const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID);

// Initial Game Freak screen
// const FRAMES_IMAGES_CID =
//   "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";
// const SAVE_STATE_CID =
//   "bafkreigta3nr75v35u3vpod5pbye5yslgkafxxamhiaiffd6elfbkdw4by";

const FRAMES_IMAGES_CID =
  "bafkreiay7vrduzi234zszhpy6cxqooxa7erg4by2j6def4wajuebkbabs4";
const SAVE_STATE_CID =
  "bafkreic4g747ynwm6vvubrjor6rx7soppnp2dm5muev3ymqfczghipnqem";

let gameData: anchor.web3.Keypair | null = null;
try {
  gameData = anchor.web3.Keypair.fromSecretKey(new Uint8Array());
} catch {}

const NUMBER_OF_STATES_TO_LOAD = 2;

export default function Admin() {
  const { gameDataAccountPublicKey } = useConfig();
  const program = useMutableProgram();

  const secondsPlayed = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );

  const oldGameStatesPdas = Array.from(
    { length: NUMBER_OF_STATES_TO_LOAD },
    (_, i) => {
      const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          gameDataAccountPublicKey.toBuffer(),
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
        program.account.gameStateV3
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
          gameDataAccountPublicKey.toBuffer(),
          Buffer.from("game_state"),
          Buffer.from("" + (secondsPlayed + 1)),
        ],
        PROGRAM_PUBLIC_KEY
      );
      const [nextNextGameStatePda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            gameDataAccountPublicKey.toBuffer(),
            Buffer.from("game_state"),
            Buffer.from("" + (secondsPlayed + 2)),
          ],
          PROGRAM_PUBLIC_KEY
        );
      console.log("sending");

      const FRAMES_IMAGES_CID = "";
      const SAVE_STATE_CID = "";

      if (FRAMES_IMAGES_CID.length > 0 && SAVE_STATE_CID.length > 0) {
        await program.methods
          .migrateGameStateToV4(FRAMES_IMAGES_CID, SAVE_STATE_CID)
          .accounts({
            gameData: gameDataAccountPublicKey,
            gameState: oldGameStatesPdas[0],
            nextGameState: nextGameStatePda,
            nextNextGameState: nextNextGameStatePda,
            systemProgram: anchor.web3.SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .rpc();
        console.log("sent");
      }
    }
  };

  const initializeCurrentParticipantsAccount = async () => {
    if (program) {
      const [currentParticipantsPda] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("current_participants"),
            gameDataAccountPublicKey.toBuffer(),
          ],
          program.programId
        );

      console.log("sending");
      await program.methods
        .initializeCurrentParticipants()
        .accounts({
          currentParticipants: currentParticipantsPda,
          gameData: gameDataAccountPublicKey,
        })
        .rpc();
      console.log("done");
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
      <AppButton onClick={initializeCurrentParticipantsAccount}>
        Initialize current participants
      </AppButton>
    </div>
  );
}
