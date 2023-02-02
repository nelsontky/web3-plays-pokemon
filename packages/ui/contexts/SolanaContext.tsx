import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  BackpackWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  BackpackIframeAdapter,
  BackpackIframeWalletName,
} from "../adapters/BackpackIframeAdapter";

require("@solana/wallet-adapter-react-ui/styles.css");

const SolanaContext = ({
  children,
  isXnft,
}: {
  children: ReactNode;
  isXnft?: boolean;
}) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL ?? clusterApiUrl(network);

  const [backpackIframePublicKey, setBackpackIframePublicKey] =
    useState<PublicKey>();
  const router = useRouter();
  useEffect(
    function loadBackpackIframePublickey() {
      if (router.isReady && isXnft) {
        setBackpackIframePublicKey(
          new PublicKey(router.query.publicKey as string)
        );
      }
    },
    [isXnft, router.isReady, router.query]
  );

  const wallets = useMemo(
    () =>
      isXnft
        ? backpackIframePublicKey === undefined
          ? []
          : [new BackpackIframeAdapter(backpackIframePublicKey)]
        : [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
            new TorusWalletAdapter(),
          ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network, backpackIframePublicKey]
  );

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={
        process.env.NEXT_PUBLIC_RPC_CONFIG
          ? JSON.parse(process.env.NEXT_PUBLIC_RPC_CONFIG)
          : undefined
      }
    >
      <WalletProvider wallets={wallets} autoConnect>
        {isXnft && <SelectBackpackIframeWallet />}
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaContext;

const SelectBackpackIframeWallet = () => {
  const { select } = useWallet();

  useEffect(() => {
    select(BackpackIframeWalletName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
