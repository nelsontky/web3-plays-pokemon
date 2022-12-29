import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
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
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("0"),
      ],
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
    assert.strictEqual(gameStateAccount.hasExecuted, true);
    assert.strictEqual(gameStateAccount.second, 0);

    assert.strictEqual(gameStateAccount.upCount, 0);
    assert.strictEqual(gameStateAccount.downCount, 0);
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

  it("Can emit event from vote", async () => {
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;
    assert.strictEqual(secondsPlayed, 1);

    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + secondsPlayed),
      ],
      program.programId
    );
    const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );
    const hasPrevGameStateExecuted = (
      await program.account.gameState.fetch(prevGameStatePda)
    ).hasExecuted;
    assert.isTrue(hasPrevGameStateExecuted);

    let listener: number;
    const [event, slot] = await new Promise<[any, number]>((resolve) => {
      listener = program.addEventListener("ExecuteGameState", (event, slot) => {
        resolve([event, slot]);
      });

      program.methods
        .vote({ a: {} })
        .accounts({
          currentGameState: gameStatePda,
          prevGameState: prevGameStatePda,
          gameData: gameData.publicKey,
          player: anchor.getProvider().publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    });
    await program.removeEventListener(listener);

    const newSecondsPlayed = (
      await program.account.gameData.fetch(gameData.publicKey)
    ).secondsPlayed;
    const prevACount = (await program.account.gameState.fetch(gameStatePda))
      .aCount;
    assert.strictEqual(newSecondsPlayed, secondsPlayed + 1);
    assert.strictEqual(prevACount, 1);
    assert.strictEqual(event.second, secondsPlayed);
    assert.isAbove(slot, 0);
  });

  it("Cannot vote to game state account with invalid game data account for current game state", async () => {
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const invalidGameData = anchor.web3.Keypair.generate();
    const secondsPlayed = gameDataAccount.secondsPlayed;
    const [invalidGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        invalidGameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + secondsPlayed),
      ],
      program.programId
    );
    const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );

    try {
      await program.methods
        .vote({ a: {} })
        .accounts({
          currentGameState: invalidGameStatePda,
          prevGameState: prevGameStatePda,
          gameData: gameData.publicKey,
          player: anchor.getProvider().publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      assert.instanceOf(e, AnchorError);
      return;
    }

    assert.fail();
  });

  it("Cannot vote to game state account with invalid game data account for previous game state", async () => {
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;
    const [invalidGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + secondsPlayed),
      ],
      program.programId
    );
    const invalidGameData = anchor.web3.Keypair.generate();
    const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        invalidGameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );

    try {
      await program.methods
        .vote({ a: {} })
        .accounts({
          currentGameState: invalidGameStatePda,
          prevGameState: prevGameStatePda,
          gameData: gameData.publicKey,
          player: anchor.getProvider().publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      assert.instanceOf(e, AnchorError);
      return;
    }

    assert.fail();
  });

  it("Cannot vote to game state account with invalid seconds played count", async () => {
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;
    const [invalidGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );

    try {
      await program.methods
        .vote({ a: {} })
        .accounts({
          currentGameState: invalidGameStatePda,
          prevGameState: invalidGameStatePda,
          gameData: gameData.publicKey,
          player: anchor.getProvider().publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      assert.instanceOf(e, AnchorError);
      return;
    }

    assert.fail();
  });

  it("Cannot vote to game state account with invalid seconds played count for previous state", async () => {
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;
    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + secondsPlayed),
      ],
      program.programId
    );

    try {
      await program.methods
        .vote({ a: {} })
        .accounts({
          currentGameState: gameStatePda,
          prevGameState: gameStatePda,
          gameData: gameData.publicKey,
          player: anchor.getProvider().publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      assert.instanceOf(e, AnchorError);
      return;
    }

    assert.fail();
  });

  it("Can vote for a move more than once", async () => {
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;
    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + secondsPlayed),
      ],
      program.programId
    );
    const [prevGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );

    await program.methods
      .vote({ a: {} })
      .accounts({
        currentGameState: gameStatePda,
        prevGameState: prevGameStatePda,
        gameData: gameData.publicKey,
        player: anchor.getProvider().publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .vote({ b: {} })
      .accounts({
        currentGameState: gameStatePda,
        prevGameState: prevGameStatePda,
        gameData: gameData.publicKey,
        player: anchor.getProvider().publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const currentGameState = await program.account.gameState.fetch(
      gameStatePda
    );

    assert.strictEqual(currentGameState.aCount, 1);
    assert.strictEqual(currentGameState.bCount, 1);
  });

  it("Can allow game data authority to update executed game state", async () => {
    const NEW_FRAMES_IMAGES_CID =
      "bafkreidqdfmwj6dm4sd6ezb7cb2q3l3rng6anbqxww3oflwrvkmvm67h24";
    const NEW_SAVE_STATE_CID =
      "bafkreigtn4qciqcpocn3yvip6vnwvxxi4bzuq5cqnv2yhsyw43t2uq5axm";

    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;

    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );
    const hasExecuted = (await program.account.gameState.fetch(gameStatePda))
      .hasExecuted;
    assert.isFalse(hasExecuted);

    await program.methods
      .updateGameState(
        secondsPlayed - 1,
        NEW_FRAMES_IMAGES_CID,
        NEW_SAVE_STATE_CID
      )
      .accounts({
        authority: anchor.getProvider().publicKey,
        gameData: gameData.publicKey,
        gameState: gameStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);
    assert.isTrue(gameState.hasExecuted);
    assert.strictEqual(gameState.framesImageCid, NEW_FRAMES_IMAGES_CID);
    assert.strictEqual(gameState.saveStateCid, NEW_SAVE_STATE_CID);
  });

  it("Does not allow wrong authority to update executed game state", async () => {
    const invalidAuthority = anchor.web3.Keypair.generate();
    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    const secondsPlayed = gameDataAccount.secondsPlayed;

    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + (secondsPlayed - 1)),
      ],
      program.programId
    );
    const hasExecuted = (await program.account.gameState.fetch(gameStatePda))
      .hasExecuted;
    assert.isTrue(hasExecuted);

    try {
      await program.methods
        .updateGameState(secondsPlayed - 1, "foo", "bar")
        .accounts({
          authority: invalidAuthority.publicKey,
          gameData: gameData.publicKey,
          gameState: gameStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([invalidAuthority])
        .rpc();
    } catch (e) {
      assert.include(e.toString(), "A has one constraint was violated");
      assert.instanceOf(e, AnchorError);
      return;
    }

    assert.fail();
  });
});
