import * as anchor from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { idl, SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import AppButton from "../components/AppButton";

const FRAMES_IMAGES_CID =
  "bafkreihkf2i57avdqabigv4a2haz7u7burj573rk4mpfzlfb2cnbg7fgue";
const SAVE_STATE_CID =
  "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";

const PROGRAM_ID = "pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK";

const gameData = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array(/* game data key */)
);

const program = new anchor.Program(
  idl as anchor.Idl,
  PROGRAM_ID
) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;

const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  [gameData.publicKey.toBuffer(), Buffer.from("game_state"), Buffer.from("0")],
  program.programId
);

export default function Initialize() {
  const { wallet } = useWallet();
  return (
    <AppButton
      onClick={async () => {
        if (wallet) {
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
