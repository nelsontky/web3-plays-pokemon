import React, { createContext, ReactNode, useContext } from "react";
import { cache } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import GlobalStyles from "../styles/GlobalStyles";
import ProgramListenersSetup from "../components/ProgramListenersSetup";
import { PublicKey } from "@solana/web3.js";
import { REALTIME_DATABASE_MESSAGES_COLLECTIONS } from "common";
import useIsXnft from "../hooks/useIsXnft";

interface ConfigContextState {
  gameDataAccountPublicKey: PublicKey;
  messagesCollection: string;
  hideStats: boolean; // Hide stats before I write code to read game memory
  isXnft: boolean;
}

const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState
);

interface ConfigProviderProps {
  gameDataAccountId: string;
  messagesCollection: string;
  hideStats?: boolean;
  children: ReactNode;
}

export default function ConfigProvider({
  gameDataAccountId,
  messagesCollection,
  hideStats,
  children,
}: ConfigProviderProps) {
  const isXnft = useIsXnft();

  if (!REALTIME_DATABASE_MESSAGES_COLLECTIONS.includes(messagesCollection)) {
    throw new Error(
      `Invalid messages collection name: ${messagesCollection}. Should be one of ${REALTIME_DATABASE_MESSAGES_COLLECTIONS}`
    );
  }

  if (isXnft && window.self === window.top) {
    return null;
  }

  return (
    <ConfigContext.Provider
      value={{
        gameDataAccountPublicKey: new PublicKey(gameDataAccountId),
        messagesCollection,
        hideStats: !!hideStats,
        isXnft: !!isXnft,
      }}
    >
      <CacheProvider value={cache}>
        <GlobalStyles />
        <ProgramListenersSetup />
        {children}
      </CacheProvider>
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
