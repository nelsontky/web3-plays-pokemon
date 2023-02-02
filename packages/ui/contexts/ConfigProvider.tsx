import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { cache } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import GlobalStyles from "../styles/GlobalStyles";
import AnchorSetup from "../components/AnchorSetup";
import ProgramListenersSetup from "../components/ProgramListenersSetup";
import { PublicKey } from "@solana/web3.js";
import { REALTIME_DATABASE_MESSAGES_COLLECTIONS } from "common";

interface ConfigContextState {
  gameDataAccountPublicKey: PublicKey;
  messagesCollection: string;
  hideStats: boolean; // Hide stats before I write code to read game memory
}

const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState
);

interface ConfigProviderProps {
  gameDataAccountId: string;
  messagesCollection: string;
  hideStats?: boolean;
  isXnft?: boolean;
  children: ReactNode;
}

export default function ConfigProvider({
  gameDataAccountId,
  messagesCollection,
  hideStats,
  children,
  isXnft,
}: ConfigProviderProps) {
  const [render, setRender] = useState(!isXnft);

  useEffect(() => {
    if (isXnft && window.self !== window.top) {
      setRender(true);
    }
  }, [isXnft]);

  if (!REALTIME_DATABASE_MESSAGES_COLLECTIONS.includes(messagesCollection)) {
    throw new Error(
      `Invalid messages collection name: ${messagesCollection}. Should be one of ${REALTIME_DATABASE_MESSAGES_COLLECTIONS}`
    );
  }

  if (!render) {
    return null;
  }

  return (
    <ConfigContext.Provider
      value={{
        gameDataAccountPublicKey: new PublicKey(gameDataAccountId),
        messagesCollection,
        hideStats: !!hideStats,
      }}
    >
      <CacheProvider value={cache}>
        <GlobalStyles />
        <AnchorSetup />
        <ProgramListenersSetup />
        {children}
      </CacheProvider>
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
