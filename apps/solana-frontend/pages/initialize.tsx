import * as anchor from "@project-serum/anchor";
import AppButton from "../components/AppButton";
import { useMutableProgram } from "../hooks/useProgram";

const FRAMES_IMAGES_CID =
  "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";
const SAVE_STATE_CID =
  "bafkreigta3nr75v35u3vpod5pbye5yslgkafxxamhiaiffd6elfbkdw4by";

const gameData = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array(/* game data key */)
);

export default function Initialize() {
  const program = useMutableProgram();
  return (
    <AppButton
      onClick={async () => {
        if (program) {
          const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
              gameData.publicKey.toBuffer(),
              Buffer.from("game_state"),
              Buffer.from("0"),
            ],
            program.programId
          );
          console.log("sending");
          await program.methods
            .initialize(FRAMES_IMAGES_CID, SAVE_STATE_CID)
            .accounts({
              authority: anchor.getProvider().publicKey,
              gameData: gameData.publicKey,
              gameState: gameStatePda,
              systemProgram: anchor.web3.SystemProgram.programId,
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
