import { Connection, PublicKey } from "@solana/web3.js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface XnftContextState {
  publicKey: PublicKey;
  connection: Connection;
}

const XnftContext = createContext<XnftContextState>({} as XnftContextState);

interface XnftContextProviderProps {
  children: ReactNode;
}

export default function XnftContextProvider({
  children,
}: XnftContextProviderProps) {
  const [publicKey, setPublicKey] = useState<PublicKey>();
  const [connection, setConnection] = useState<Connection>();

  useEffect(function pollXnft() {
    setTimeout(function checkXnft() {
      const solana = window.xnft?.solana;
      if (solana) {
        setPublicKey(solana.publicKey);
        setConnection(solana.connection);
      } else {
        checkXnft();
      }
    }, 100);
  }, []);

  if (!publicKey || !connection) {
    return null;
  }

  return (
    <XnftContext.Provider
      value={{
        connection,
        publicKey,
      }}
    >
      {children}
    </XnftContext.Provider>
  );
}

export const useXnft = () => useContext(XnftContext);
