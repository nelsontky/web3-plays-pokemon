import * as anchor from "@project-serum/anchor";
import AppButton from "../components/AppButton";
import { useMutableProgram } from "../hooks/useProgram";

const FRAMES_IMAGES_CID =
  "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";
const SAVE_STATE_CID =
  "bafkreigta3nr75v35u3vpod5pbye5yslgkafxxamhiaiffd6elfbkdw4by";

let gameData: anchor.web3.Keypair | null = null;
try {
  gameData = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(/* game data key */)
  );
} catch {}

export default function Initialize() {
  const program = useMutableProgram();
  return (
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
  );
}
