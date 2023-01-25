import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PROGRAM_ID } from "common";
import { useMemo } from "react";
import { idl, SolanaPlaysPokemonProgram } from "solana-plays-pokemon-program";

export const useMutableProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(
    () =>
      wallet
        ? new anchor.AnchorProvider(connection, wallet, {
            commitment: "processed",
          })
        : null,
    [connection, wallet]
  );

  if (!provider) {
    return null;
  }

  return new anchor.Program(
    idl as anchor.Idl,
    PROGRAM_ID,
    provider
  ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;
};

const readonlyKeypair = anchor.web3.Keypair.generate();
export const useReadonlyProgram = () => {
  const { connection } = useConnection();
  const readonlyProvider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: readonlyKeypair.publicKey,
      signTransaction: (() => {}) as any,
      signAllTransactions: (() => {}) as any,
    },
    {
      commitment: "processed",
    }
  );

  return new anchor.Program(
    idl as anchor.Idl,
    PROGRAM_ID,
    readonlyProvider
  ) as unknown as anchor.Program<SolanaPlaysPokemonProgram>;
};
