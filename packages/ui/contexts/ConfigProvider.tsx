import React, { createContext, ReactNode, useContext } from "react";
import { cache } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import GlobalStyles from "../styles/GlobalStyles";
import AnchorSetup from "../components/AnchorSetup";
import ProgramListenersSetup from "../components/ProgramListenersSetup";
import { PublicKey } from "@solana/web3.js";

interface ConfigContextState {
  gameDataAccountPublicKey: PublicKey;
  hideStats: boolean; // Hide stats before I write code to read game memory
}

const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState
);

interface ConfigProviderProps {
  gameDataAccountId: string;
  hideStats?: boolean;
  children: ReactNode;
}

export default function ConfigProvider({
  gameDataAccountId,
  hideStats,
  children,
}: ConfigProviderProps) {
  return (
    <ConfigContext.Provider
      value={{
        gameDataAccountPublicKey: new PublicKey(gameDataAccountId),
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
