import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { GAME_DATAS } from "common";
import { NextApiRequest, NextApiResponse } from "next";
import runCorsMiddleware from "../../utils/cors";
import initSolana from "../../utils/init-solana";
import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import getIsValidSplMint from "../../utils/get-is-valid-spl-mint";

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
      executedStatesCount,
    }: {
      publicKey?: string;
      gameDataAccountId?: string;
      buttonId?: number;
      splMint?: string;
      isTurbo?: boolean;
      executedStatesCount?: number;
    } = req.body;

    const { connection, keypair, program } = initSolana();
    if (
      publicKey === undefined ||
      splMint === undefined ||
      executedStatesCount === undefined ||
      buttonId === undefined ||
      !getIsValidSplMint(splMint) ||
      !GAME_DATAS[gameDataAccountId as string]
    ) {
      return res.status(400).json({ result: "Bad request" });
    }

    const gameDataAccount = new PublicKey(gameDataAccountId as string);

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

    const { blockhash } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
      payerKey: keypair.publicKey,
      instructions: [ix],
      recentBlockhash: blockhash,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);

    try {
      const status = await connection.simulateTransaction(transaction, {
        sigVerify: false,
      });
      if (status.value.err) {
        throw new Error(JSON.stringify(status.value.err));
      }
    } catch (e) {
      return res
        .status(400)
        .json({ result: e instanceof Error ? e.message : "Bad request" });
    }

    transaction.sign([keypair]);
    const serializedTransaction = transaction.serialize();

    return res
      .status(200)
      .json({ result: Buffer.from(serializedTransaction).toString("base64") });
  } catch {
    return res.status(500).end();
  }
}
