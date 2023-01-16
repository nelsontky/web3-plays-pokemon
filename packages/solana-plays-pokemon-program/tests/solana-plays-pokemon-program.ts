import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";
import { SolanaPlaysPokemonProgram } from "../target/types/solana_plays_pokemon_program";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import * as mplTokenMetadata from "@metaplex-foundation/mpl-token-metadata";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

describe("solana-plays-pokemon-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .SolanaPlaysPokemonProgram as Program<SolanaPlaysPokemonProgram>;

  const gameData = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    const FRAMES_IMAGES_CID =
      "bafkreiajqssnp7kgdly427gkmdkl42zjpjlcbhat33ob2dlu4ngeabkriq";
    const SAVE_STATE_CID =
      "bafkreigta3nr75v35u3vpod5pbye5yslgkafxxamhiaiffd6elfbkdw4by";

    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("0"),
      ],
      program.programId
    );
    const [nextGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameData.publicKey.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("1"),
      ],
      program.programId
    );

    await program.methods
      .initialize(FRAMES_IMAGES_CID, SAVE_STATE_CID)
      .accounts({
        authority: anchor.getProvider().publicKey,
        gameData: gameData.publicKey,
        gameState: gameStatePda,
        nextGameState: nextGameStatePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gameData])
      .rpc();

    const gameDataAccount = await program.account.gameData.fetch(
      gameData.publicKey
    );
    assert.strictEqual(gameDataAccount.executedStatesCount, 1);
    assert.strictEqual(
      gameDataAccount.authority.toBase58(),
      anchor.getProvider().publicKey.toBase58()
    );
    assert.isFalse(gameDataAccount.isExecuting);

    const gameStateAccount = await program.account.gameStateV4.fetch(
      gameStatePda
    );
    assert.strictEqual(gameStateAccount.index, 0);

    assert.strictEqual(gameStateAccount.buttonPresses.length, 0);

    assert.isAbove(gameStateAccount.createdAt.toNumber(), 0);

    assert.strictEqual(gameStateAccount.framesImageCid, FRAMES_IMAGES_CID);
    assert.strictEqual(gameStateAccount.saveStateCid, SAVE_STATE_CID);

    const nextGameStateAccount = await program.account.gameStateV4.fetch(
      nextGameStatePda
    );
    assert.strictEqual(nextGameStateAccount.index, 1);

    assert.strictEqual(nextGameStateAccount.buttonPresses.length, 0);

    assert.isAbove(nextGameStateAccount.createdAt.toNumber(), 0);

    assert.strictEqual(nextGameStateAccount.framesImageCid, "");
    assert.strictEqual(nextGameStateAccount.saveStateCid, "");
  });

  // it("Cannot vote to game state account with invalid game data account for current game state", async () => {
  //   const invalidGameData = anchor.web3.Keypair.generate();
  //   const [invalidGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       invalidGameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("0"),
  //     ],
  //     program.programId
  //   );
  //   const [invalidNextGameStatePda] =
  //     anchor.web3.PublicKey.findProgramAddressSync(
  //       [
  //         invalidGameData.publicKey.toBuffer(),
  //         Buffer.from("game_state"),
  //         Buffer.from("1"),
  //       ],
  //       program.programId
  //     );
  //   // init invalid pdas
  //   await program.methods
  //     .initialize("foo", "bar")
  //     .accounts({
  //       authority: anchor.getProvider().publicKey,
  //       gameData: invalidGameData.publicKey,
  //       gameState: invalidGameStatePda,
  //       nextGameState: invalidNextGameStatePda,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([invalidGameData])
  //     .rpc();

  //   try {
  //     await program.methods
  //       .sendButton(9, 1) // A
  //       .accounts({
  //         gameState: invalidNextGameStatePda,
  //         gameData: gameData.publicKey,
  //         player: anchor.getProvider().publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //         clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //       })
  //       .rpc();
  //   } catch (e) {
  //     if (e instanceof AnchorError) {
  //       // ConstraintSeeds error
  //       assert.strictEqual(e.error.errorCode.number, 2006);
  //       return;
  //     }
  //   }

  //   assert.fail();
  // });

  // it("Cannot vote to game state account with invalid seconds played count", async () => {
  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const secondsPlayed = gameDataAccount.executedStatesCount;
  //   const [invalidGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + (secondsPlayed - 1)),
  //     ],
  //     program.programId
  //   );

  //   try {
  //     await program.methods
  //       .sendButton(9, 1) // A
  //       .accounts({
  //         gameState: invalidGameStatePda,
  //         gameData: gameData.publicKey,
  //         player: anchor.getProvider().publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //         clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //       })
  //       .rpc();
  //   } catch (e) {
  //     if (e instanceof AnchorError) {
  //       // ConstraintSeeds error
  //       assert.strictEqual(e.error.errorCode.number, 2006);
  //       return;
  //     }
  //   }

  //   assert.fail();
  // });

  // it("Cannot vote for invalid button", async () => {
  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const secondsPlayed = gameDataAccount.executedStatesCount;
  //   const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + secondsPlayed),
  //     ],
  //     program.programId
  //   );

  //   try {
  //     await program.methods
  //       .sendButton(13, 1)
  //       .accounts({
  //         gameState: gameStatePda,
  //         gameData: gameData.publicKey,
  //         player: anchor.getProvider().publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //         clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //       })
  //       .rpc();
  //   } catch (e) {
  //     if (e instanceof AnchorError) {
  //       // InvalidButton error
  //       assert.strictEqual(e.error.errorCode.number, 6002);
  //       return;
  //     }
  //   }

  //   assert.fail();
  // });

  // it("Can vote for a move more than once", async () => {
  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const secondsPlayed = gameDataAccount.executedStatesCount;
  //   const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + secondsPlayed),
  //     ],
  //     program.programId
  //   );

  //   await program.methods
  //     .sendButton(9, 1) // A
  //     .accounts({
  //       gameState: gameStatePda,
  //       gameData: gameData.publicKey,
  //       player: anchor.getProvider().publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //     })
  //     .rpc();

  //   await program.methods
  //     .sendButton(10, 1) // B
  //     .accounts({
  //       gameState: gameStatePda,
  //       gameData: gameData.publicKey,
  //       player: anchor.getProvider().publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //     })
  //     .rpc();

  //   const currentGameState = await program.account.gameStateV4.fetch(
  //     gameStatePda
  //   );

  //   assert.deepEqual(Array.from(currentGameState.buttonPresses), [9, 10]);
  // });

  // it("Does not allow update of executed game state when not executing", async () => {
  //   const NEW_FRAMES_IMAGES_CID =
  //     "bafkreidqdfmwj6dm4sd6ezb7cb2q3l3rng6anbqxww3oflwrvkmvm67h24";
  //   const NEW_SAVE_STATE_CID =
  //     "bafkreigtn4qciqcpocn3yvip6vnwvxxi4bzuq5cqnv2yhsyw43t2uq5axm";

  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const isExecuting = gameDataAccount.isExecuting;
  //   assert.isFalse(isExecuting);

  //   const secondsPlayed = gameDataAccount.executedStatesCount;

  //   const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + secondsPlayed),
  //     ],
  //     program.programId
  //   );
  //   const [nextGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + (secondsPlayed + 1)),
  //     ],
  //     program.programId
  //   );

  //   try {
  //     await program.methods
  //       .updateGameState(NEW_FRAMES_IMAGES_CID, NEW_SAVE_STATE_CID)
  //       .accounts({
  //         authority: anchor.getProvider().publicKey,
  //         gameData: gameData.publicKey,
  //         gameState: gameStatePda,
  //         nextGameState: nextGameStatePda,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();
  //   } catch (e) {
  //     if (e instanceof AnchorError) {
  //       // NoUpdatesIfNotExecuting error
  //       assert.strictEqual(e.error.errorCode.number, 6001);
  //       return;
  //     }
  //   }

  //   assert.fail();
  // });

  // it("Does not allow wrong authority to update executed game state", async () => {
  //   const invalidAuthority = anchor.web3.Keypair.generate();
  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const secondsPlayed = gameDataAccount.executedStatesCount;

  //   const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + secondsPlayed),
  //     ],
  //     program.programId
  //   );
  //   const [nextGameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + (secondsPlayed + 1)),
  //     ],
  //     program.programId
  //   );

  //   // fund invalid authority
  //   const sendLamportsIx = anchor.web3.SystemProgram.transfer({
  //     fromPubkey: anchor.getProvider().publicKey,
  //     toPubkey: invalidAuthority.publicKey,
  //     lamports: anchor.web3.LAMPORTS_PER_SOL,
  //   });
  //   await anchor
  //     .getProvider()
  //     .sendAndConfirm(new anchor.web3.Transaction().add(sendLamportsIx));

  //   try {
  //     await program.methods
  //       .updateGameState("foo", "bar")
  //       .accounts({
  //         authority: invalidAuthority.publicKey,
  //         gameData: gameData.publicKey,
  //         gameState: gameStatePda,
  //         nextGameState: nextGameStatePda,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([invalidAuthority])
  //       .rpc();
  //   } catch (e) {
  //     if (e instanceof AnchorError) {
  //       // ConstraintHasOne error
  //       assert.strictEqual(e.error.errorCode.number, 2001);
  //       return;
  //     }
  //   }

  //   assert.fail();
  // });

  // it("Cannot vote for more than 2 buttons at once", async () => {
  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const secondsPlayed = gameDataAccount.executedStatesCount;
  //   const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + secondsPlayed),
  //     ],
  //     program.programId
  //   );

  //   try {
  //     await program.methods
  //       .sendButton(9, 3)
  //       .accounts({
  //         gameState: gameStatePda,
  //         gameData: gameData.publicKey,
  //         player: anchor.getProvider().publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //         clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //       })
  //       .rpc();
  //   } catch (e) {
  //     if (e instanceof AnchorError) {
  //       // InvalidButtonPressCount error
  //       assert.strictEqual(e.error.errorCode.number, 6003);
  //       return;
  //     }
  //   }

  //   assert.fail();
  // });

  // it("Cannot exceed 10 moves per round", async () => {
  //   const gameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   const secondsPlayed = gameDataAccount.executedStatesCount;
  //   const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [
  //       gameData.publicKey.toBuffer(),
  //       Buffer.from("game_state"),
  //       Buffer.from("" + secondsPlayed),
  //     ],
  //     program.programId
  //   );

  //   for (let i = 0; i < 7; i++) {
  //     // make it such that 9 button presses have been sent (2 were sent in a previous test)
  //     await program.methods
  //       .sendButton(9, 1) // A
  //       .accounts({
  //         gameState: gameStatePda,
  //         gameData: gameData.publicKey,
  //         player: anchor.getProvider().publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //         clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //       })
  //       .rpc();
  //   }

  //   // send a total of 11 moves
  //   await program.methods
  //     .sendButton(10, 2) // B
  //     .accounts({
  //       gameState: gameStatePda,
  //       gameData: gameData.publicKey,
  //       player: anchor.getProvider().publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  //     })
  //     .rpc();

  //   const currentGameState = await program.account.gameStateV4.fetch(
  //     gameStatePda
  //   );

  //   assert.deepEqual(
  //     Array.from(currentGameState.buttonPresses),
  //     [9, 10, 9, 9, 9, 9, 9, 9, 9, 10]
  //   );

  //   const currentGameDataAccount = await program.account.gameData.fetch(
  //     gameData.publicKey
  //   );
  //   assert.isTrue(currentGameDataAccount.isExecuting);
  // });

  it("Can mint NFT", async () => {
    // const user = anchor.web3.Keypair.generate();
    // const signature = await anchor
    //   .getProvider()
    //   .connection.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    // const { blockhash, lastValidBlockHeight } = await anchor
    //   .getProvider()
    //   .connection.getLatestBlockhash();
    // await anchor.getProvider().connection.confirmTransaction({
    //   blockhash,
    //   lastValidBlockHeight,
    //   signature,
    // });

    const user = anchor.web3.Keypair.fromSecretKey(
      bs58.decode(
        "4mm97NGa7WmiNWWQiaW7asKJhnypnwdkoP8hkbufFfYdd1whirYrGrGKBgtLfVDDT3W6hiskevmVyy48GvEG81S6"
      )
    );

    const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("nft_mint"),
        gameData.publicKey.toBuffer(),
        user.publicKey.toBuffer(),
        Buffer.from("" + 0),
      ],
      program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(mint, user.publicKey);

    const NAME = "Test NFT";
    const METADATA_URI =
      "https://arweave.net/4yrRwYcsy8qI8mV71j4VFtGj4ZR21EgsfvkPGpJxqTQ";

    const metaplex = Metaplex.make(anchor.getProvider().connection).use(
      walletAdapterIdentity(anchor.AnchorProvider.env().wallet)
    );
    const { nft: collectionNft } = await metaplex.nfts().create({
      name: "Test Collection",
      uri: "https://arweave.net/qmFuWrUYBkv7cpwMCIUhCMSLH7dE3vj6vp5kXUzB_Nk",
      sellerFeeBasisPoints: 0,
      isCollection: true,
    });

    const [collectionMasterEdition] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          mplTokenMetadata.PROGRAM_ID.toBuffer(),
          collectionNft.address.toBuffer(),
          Buffer.from("edition"),
        ],
        mplTokenMetadata.PROGRAM_ID
      );

    const [tokenMetadataAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        mplTokenMetadata.PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      mplTokenMetadata.PROGRAM_ID
    );

    await program.methods
      .mintFramesNft(0, NAME, METADATA_URI)
      .accounts({
        gameData: gameData.publicKey,
        mint,
        tokenAccount,
        authority: anchor.getProvider().publicKey,
        user: user.publicKey,
        tokenMetadataAccount,
        tokenMetadataProgram: mplTokenMetadata.PROGRAM_ID,
        collectionMetadata: collectionNft.metadataAddress,
        collectionMasterEdition,
        collectionMint: collectionNft.address,
      })
      .signers([user])
      .rpc({
        skipPreflight: true,
      });

    // const userAta = await getAccount(
    //   anchor.getProvider().connection,
    //   tokenAccount
    // );

    // assert.strictEqual(Number(userAta.amount), 1);
  });
});
