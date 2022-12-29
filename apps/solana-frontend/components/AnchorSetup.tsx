import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import * as anchor from "@project-serum/anchor";

export default function AnchorSetup() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(
    function setupAnchor() {
      if (wallet) {
        const provider = new anchor.AnchorProvider(connection, wallet, {});
        anchor.setProvider(provider);
      }
    },
    [connection, wallet]
  );
  
  return null;
}
