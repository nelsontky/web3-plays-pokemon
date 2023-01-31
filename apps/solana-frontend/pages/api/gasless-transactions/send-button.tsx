import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { GAME_DATAS } from "common";
import { NextApiRequest, NextApiResponse } from "next";
import runCorsMiddleware from "../../../utils/cors";
import initSolana from "../../../utils/init-solana";
import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import getIsValidSplMint from "../../../utils/get-is-valid-spl-mint";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await runCorsMiddleware(req, res);

    if (req.method !== "POST") {
      return res.status(404).end();
    }

    const {
      publicKey,
      gameDataAccountId,
      buttonId,
      splMint,
      isTurbo,
    }: {
      publicKey?: string;
      gameDataAccountId?: string;
      buttonId?: number;
      splMint?: string;
      isTurbo?: boolean;
    } = req.body;

    const { connection, keypair, program } = initSolana();

    const gameDataAccount = new PublicKey(gameDataAccountId as string);
    const gameData = await program.account.gameData.fetch(gameDataAccount);
    const executedStatesCount = gameData.executedStatesCount;

    const isValidButton =
      buttonId === undefined
        ? false
        : buttonId < 5 || (buttonId > 8 && buttonId < 13);

    if (
      publicKey === undefined ||
      !isValidButton ||
      splMint === undefined ||
      !getIsValidSplMint(splMint) ||
      !GAME_DATAS[gameDataAccountId as string]
    ) {
      return res.status(400).json({ result: "Bad request" });
    }
    const gasMint = new PublicKey(splMint);
    const player = new PublicKey(publicKey);

    const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        gameDataAccount.toBuffer(),
        Buffer.from("game_state"),
        Buffer.from("" + executedStatesCount),
      ],
      program.programId
    );
    const [currentParticipantsPda] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("current_participants"), gameDataAccount.toBuffer()],
        program.programId
      );
    const [splPricesPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("spl_prices"), gasMint.toBuffer()],
      program.programId
    );
    const gasDepositTokenAccount = getAssociatedTokenAddressSync(
      gasMint,
      keypair.publicKey
    );
    const gasSourceTokenAccount = getAssociatedTokenAddressSync(
      gasMint,
      player
    );

    const ix = await program.methods
      .sendButtonSplGas(buttonId as number, isTurbo ? 2 : 1)
      .accounts({
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        authority: keypair.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
        currentParticipants: currentParticipantsPda,
        gameData: gameDataAccount,
        gameState: gameStatePda,
        gasDepositTokenAccount,
        gasMint,
        gasSourceTokenAccount,
        player,
        splPrices: splPricesPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const transaction = new Transaction().add(ix);
    transaction.feePayer = keypair.publicKey;
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.partialSign(keypair);
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    return res
      .status(200)
      .json({ result: serializedTransaction.toString("base64") });
  } catch {
    return res.status(500).end();
  }
}
