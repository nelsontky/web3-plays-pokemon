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
  "bafkreiay7vrduzi234zszhpy6cxqooxa7erg4by2j6def4wajuebkbabs4";
const SAVE_STATE_CID =
  "bafkreic4g747ynwm6vvubrjor6rx7soppnp2dm5muev3ymqfczghipnqem";

let gameData: anchor.web3.Keypair | null = null;
try {
  gameData = anchor.web3.Keypair.fromSecretKey(new Uint8Array());
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

      const FRAMES_IMAGES_CID = "";
      const SAVE_STATE_CID = "";

      if (FRAMES_IMAGES_CID.length > 0 && SAVE_STATE_CID.length > 0) {
        await program.methods
          .migrateGameStateToV4(FRAMES_IMAGES_CID, SAVE_STATE_CID)
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
    }
  };

  const initializeMintedNftsCountAccount = async () => {
    if (program) {
      const [mintedNftsCountPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("minted_nfts_count"),
          GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
        ],
        program.programId
      );

      console.log("sending");
      await program.methods
        .initializeMintedNftsCount()
        .accounts({
          mintedNftsCount: mintedNftsCountPda,
          gameData: GAME_DATA_ACCOUNT_PUBLIC_KEY,
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
      <AppButton onClick={initializeMintedNftsCountAccount}>
        Initialize minted nfts count
      </AppButton>
    </div>
  );
}
