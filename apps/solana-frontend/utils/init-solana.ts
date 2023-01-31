import * as anchor from "@project-serum/anchor";
import { PROGRAM_ID } from "common";
import { SolanaPlaysPokemonProgram, idl } from "solana-plays-pokemon-program";

export default function initSolana() {
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
