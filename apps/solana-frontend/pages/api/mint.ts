import type { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";
import { idl, SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";
import {
  CELL_SIZE,
  FRAMES_TO_DRAW_PER_EXECUTION,
  GAMEBOY_CAMERA_HEIGHT,
  GAMEBOY_CAMERA_WIDTH,
  getGameStateParticipants,
  NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
  PROGRAM_ID,
  renderFrame,
  fetchIpfsCid,
  GAME_DATA_COLLECTION_IDS,
  GAME_DATAS,
  GAME_DATA_ACCOUNT_ID,
} from "common";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { inflate } from "pako";
import streamBuffers from "stream-buffers";
import { NFTStorage, Blob } from "nft.storage";
import GIFEncoder from "gifencoder";
import { createCanvas } from "@napi-rs/canvas";
import * as mplTokenMetadata from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Transaction } from "@solana/web3.js";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(404).end();
    }

    const {
      publicKey,
      gameStateIndex,
      gameDataAccountId,
    }: {
      publicKey?: string;
      gameStateIndex?: number;
      gameDataAccountId?: string;
    } = req.body;

    if (
      publicKey === undefined ||
      gameStateIndex === undefined ||
      !GAME_DATAS[gameDataAccountId as string]
    ) {
      return res.status(400).json({ result: "Bad request" });
    }

    const GAME_DATA_ACCOUNT_PUBLIC_KEY = new PublicKey(
      gameDataAccountId as string
    );

    const { connection, keypair, program } = initSolana();
    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + gameStateIndex),
      ],
      program.programId
    );

    const isDevnet = connection.rpcEndpoint.includes("solana-devnet");
    const isParticipant =
      isDevnet || (await getIsParticipant(gameStatePda, publicKey));
    if (!isParticipant) {
      return res.status(403).json({
        result:
          "Ineligible for mint as your wallet did not participate in this round :'(",
      });
    }

    const gameState = await Promise.any([
      program.account.gameStateV4.fetch(gameStatePda),
      program.account.gameStateV3.fetch(gameStatePda),
      program.account.gameStateV2.fetch(gameStatePda),
      program.account.gameState.fetch(gameStatePda),
    ]);

    const metadataUri = await getNftMetadataUri(
      gameDataAccountId as string,
      gameStateIndex,
      gameState.framesImageCid
    );

    const serializedTransaction = await buildMintNftTx(
      connection,
      keypair,
      program,
      publicKey,
      gameStateIndex,
      metadataUri,
      GAME_DATA_ACCOUNT_PUBLIC_KEY
    );

    return res
      .status(200)
      .json({ result: serializedTransaction.toString("base64") });
  } catch (e) {
    return res.status(500).json({
      result:
        "An unspecified error has occurred. Please refresh the page and try again.",
    });
  }
}

async function getIsParticipant(
  gameStatePda: anchor.web3.PublicKey,
  publicKey: string
) {
  const gameStateParticipants = await getGameStateParticipants(gameStatePda);
  const participant = gameStateParticipants.find(
    (participant) => participant.signer === publicKey
  );

  if (!participant) {
    return false;
  }

  const txDetails = await axios.get(
    `https://public-api.solscan.io/transaction/${participant.txHash}`,
    {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    }
  );
  const wasPdaWritable = txDetails.data.inputAccount.find(
    (inputAccount: any) => inputAccount.account === gameStatePda.toBase58()
  )?.writable;
  const isCorrectProgram =
    txDetails.data.parsedInstruction[0].programId === PROGRAM_ID;

  return wasPdaWritable && isCorrectProgram;
}

function initSolana() {
  const connection = new anchor.web3.Connection(
    process.env.NEXT_PUBLIC_RPC_URL!,
    process.env.NEXT_PUBLIC_RPC_CONFIG
      ? JSON.parse(process.env.NEXT_PUBLIC_RPC_CONFIG)
      : undefined
  );

  const randomKeypair = anchor.web3.Keypair.generate();
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: randomKeypair.publicKey,
      signTransaction: (() => {}) as any,
      signAllTransactions: (() => {}) as any,
    },
    { commitment: "processed" }
  );
  anchor.setProvider(provider);

  const keypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.WALLET_PRIVATE_KEY!))
  );

  const program = new anchor.Program(
    idl as anchor.Idl,
    PROGRAM_ID
  ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;

  return { connection, keypair, program };
}

async function getNftMetadataUri(
  gameDataAccountId: string,
  gameStateIndex: number,
  framesImageDataCid: string
) {
  const responseData = await fetchIpfsCid(framesImageDataCid);
  const inflated = inflate(responseData, { to: "string" });
  const framesImageData: number[][] = JSON.parse(inflated);

  const encoder = new GIFEncoder(
    GAMEBOY_CAMERA_WIDTH * CELL_SIZE,
    GAMEBOY_CAMERA_HEIGHT * CELL_SIZE
  );
  const writableStreamBuffer = new streamBuffers.WritableStreamBuffer();
  encoder.createReadStream().pipe(writableStreamBuffer);
  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  const frameDelay =
    1000 /
    (FRAMES_TO_DRAW_PER_EXECUTION /
      NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS);
  encoder.setDelay(Math.floor(frameDelay));

  const canvas = createCanvas(
    GAMEBOY_CAMERA_WIDTH * CELL_SIZE,
    GAMEBOY_CAMERA_HEIGHT * CELL_SIZE
  );
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < framesImageData.length; i++) {
    const frame = framesImageData[i];

    const isLastFrame = i === framesImageData.length - 1;
    if (isLastFrame) {
      encoder.setDelay(2000);
    }

    renderFrame(frame, ctx as any);
    encoder.addFrame(ctx as any);
  }

  encoder.finish();

  const gifBuffer: Buffer = await new Promise((resolve, reject) => {
    writableStreamBuffer.on("close", () => {
      resolve(writableStreamBuffer.getContents() as Buffer);
    });
    writableStreamBuffer.on("error", () => {
      reject();
    });
  });

  // pin to nft.storage
  const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN! });
  const image = new Blob([gifBuffer], {
    type: "image/gif",
  });
  const imageCid = await client.storeBlob(image);

  const metadata = JSON.stringify(
    generateMetadata(
      gameDataAccountId,
      gameStateIndex,
      `https://${imageCid}.ipfs.nftstorage.link`
    )
  );
  const metadataBlob = new Blob([metadata]);
  const metadataCid = await client.storeBlob(metadataBlob);

  return `https://${metadataCid}.ipfs.nftstorage.link`;
}

async function buildMintNftTx(
  connection: anchor.web3.Connection,
  keypair: anchor.web3.Keypair,
  program: anchor.Program<SolanaPlaysPokemonProgram>,
  publicKey: string,
  gameStateIndex: number,
  metadataUri: string,
  gameDataAccountPublicKey: PublicKey
) {
  const pkey = new anchor.web3.PublicKey(publicKey);

  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("nft_mint"),
      gameDataAccountPublicKey.toBuffer(),
      pkey.toBuffer(),
      Buffer.from("" + gameStateIndex),
    ],
    program.programId
  );
  const tokenAccount = await getAssociatedTokenAddress(mint, pkey);

  const COLLECTION_PUBLIC_KEY = new PublicKey(
    GAME_DATA_COLLECTION_IDS[gameDataAccountPublicKey.toBase58()]
  );
  const [collectionMasterEdition] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        mplTokenMetadata.PROGRAM_ID.toBuffer(),
        COLLECTION_PUBLIC_KEY.toBuffer(),
        Buffer.from("edition"),
      ],
      mplTokenMetadata.PROGRAM_ID
    );
  const [collectionMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      mplTokenMetadata.PROGRAM_ID.toBuffer(),
      COLLECTION_PUBLIC_KEY.toBuffer(),
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
  const [masterEdition] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      mplTokenMetadata.PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    mplTokenMetadata.PROGRAM_ID
  );
  const gameData = await program.account.gameData.fetch(
    gameDataAccountPublicKey
  );
  const [mintedNftPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("minted_nft"),
      gameDataAccountPublicKey.toBuffer(),
      Buffer.from("" + gameData.nftsMinted),
    ],
    program.programId
  );

  const mintIx = await program.methods
    .mintFramesNft(
      gameStateIndex,
      `Solana Plays Pokemon #${gameStateIndex}`,
      metadataUri
    )
    .accounts({
      gameData: gameDataAccountPublicKey,
      mint,
      tokenAccount,
      authority: keypair.publicKey,
      user: pkey,
      tokenMetadataAccount,
      tokenMetadataProgram: mplTokenMetadata.PROGRAM_ID,
      collectionMetadata: collectionMetadata,
      collectionMasterEdition,
      collectionMint: COLLECTION_PUBLIC_KEY,
      masterEdition,
      mintedNft: mintedNftPda,
    })
    .instruction();

  // sign and serialize transaction
  const transaction = new Transaction().add(mintIx).add(
    anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    })
  );
  transaction.feePayer = pkey;
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  transaction.partialSign(keypair);
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });
  return serializedTransaction;
}

const generateMetadata = (
  gameDataAccountId: string,
  round: number,
  imageUrl: string
) => {
  const baseTitle =
    gameDataAccountId === GAME_DATA_ACCOUNT_ID
      ? "Solana Plays Pokemon"
      : "Solana Plays Pokemon Crystal";
  const game =
    gameDataAccountId === GAME_DATA_ACCOUNT_ID
      ? "Pokemon Red"
      : "Pokemon Crystal";
  const version = gameDataAccountId === GAME_DATA_ACCOUNT_ID ? "v1" : "v2";
  return {
    name: `${baseTitle} #${round}`,
    symbol: "PKM",
    description: `Round #${round} of ${baseTitle}.`,
    image: imageUrl,
    animation_url: imageUrl,
    external_url: "https://solana.playspokemon.xyz",
    attributes: [
      {
        trait_type: "Round",
        value: round,
      },
      {
        trait_type: "Game",
        value: game,
      },
      {
        trait_type: "Version",
        value: version,
      },
    ],
    properties: {
      files: [
        {
          uri: imageUrl,
          type: "image/gif",
        },
      ],
      category: "image",
    },
  };
};
