import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { SolanaPlaysPokemonProgram } from "../target/types/solana_plays_pokemon_program";

describe("solana-plays-pokemon-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaPlaysPokemonProgram as Program<SolanaPlaysPokemonProgram>;

  const saveState = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        saveState: saveState.publicKey,
      })
      .preInstructions([
        await program.account.saveState.createInstruction(saveState),
      ])
      .signers([saveState])
      .rpc();

    const account = await program.account.saveState.fetch(saveState.publicKey);
    assert.strictEqual(account.secondsPlayed.toNumber(), 0);
  });
});
