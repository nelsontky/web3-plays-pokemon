import React, { createContext, ReactNode, useContext } from "react";
import { cache } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import GlobalStyles from "../styles/GlobalStyles";
import AnchorSetup from "../components/AnchorSetup";
import ProgramListenersSetup from "../components/ProgramListenersSetup";
import AnnouncementBar from "../components/AnnouncementBar";
import AppBar from "../components/AppBar";
import { PublicKey } from "@solana/web3.js";

interface ConfigContextState {
  gameDataAccountPublicKey: PublicKey;
}

const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState
);

interface ConfigProviderProps {
  gameDataAccountId: string;
  children: ReactNode;
}

export default function ConfigProvider({
  gameDataAccountId,
  children,
}: ConfigProviderProps) {
  return (
    <ConfigContext.Provider
      value={{
        gameDataAccountPublicKey: new PublicKey(gameDataAccountId),
      }}
    >
      <CacheProvider value={cache}>
        <GlobalStyles />
        <AnchorSetup />
        <ProgramListenersSetup />
        <AnnouncementBar />
        <AppBar />
        {children}
      </CacheProvider>
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
