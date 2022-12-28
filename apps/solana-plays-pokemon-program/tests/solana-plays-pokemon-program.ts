import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { SolanaPlaysPokemonProgram } from "../target/types/solana_plays_pokemon_program";

describe("solana-plays-pokemon-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaPlaysPokemonProgram as Program<SolanaPlaysPokemonProgram>;

  const gameData = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    const FRAMES_IMAGES_CID =
      "bafkreihkf2i57avdqabigv4a2haz7u7burj573rk4mpfzlfb2cnbg7fgue";
    const SAVE_STATE_CID =
      "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";

    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [gameData.publicKey.toBuffer(), Buffer.from("0")],
      program.programId
    );

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

    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    assert.strictEqual(gameDataAccount.secondsPlayed, 1);
    assert.strictEqual(
      gameDataAccount.authority.toBase58(),
      anchor.getProvider().publicKey.toBase58()
    );

    const gameStateAccount = await program.account.gameState.fetch(
      gameStatePda
    );
    assert.strictEqual(gameStateAccount.isVotingClosed, true);
    assert.strictEqual(gameStateAccount.second, 0);

    assert.strictEqual(gameStateAccount.upCount, 0);
    assert.strictEqual(gameStateAccount.downCount, 0);
    assert.strictEqual(gameStateAccount.leftCount, 0);
    assert.strictEqual(gameStateAccount.leftCount, 0);
    assert.strictEqual(gameStateAccount.rightCount, 0);
    assert.strictEqual(gameStateAccount.aCount, 0);
    assert.strictEqual(gameStateAccount.bCount, 0);
    assert.strictEqual(gameStateAccount.startCount, 0);
    assert.strictEqual(gameStateAccount.selectCount, 0);
    assert.strictEqual(gameStateAccount.nothingCount, 1);

    assert.strictEqual(gameStateAccount.framesImageCid, FRAMES_IMAGES_CID);
    assert.strictEqual(gameStateAccount.saveStateCid, SAVE_STATE_CID);
  });
});
