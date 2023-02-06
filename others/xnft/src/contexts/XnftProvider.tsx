import {
  Connection,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface BackpackWallet {
  isBackpack?: boolean;
  publicKey: PublicKey;
  isConnected: boolean;
  signTransaction(
    transaction: Transaction | VersionedTransaction,
    publicKey?: PublicKey | null
  ): Promise<Transaction | VersionedTransaction>;
  signAllTransactions(
    transactions: Transaction[] | VersionedTransaction[],
    publicKey?: PublicKey | null
  ): Promise<Transaction[] | VersionedTransaction[]>;
  send(
    transaction: Transaction,
    signers?: Signer[],
    options?: SendOptions,
    connection?: Connection,
    publicKey?: PublicKey | null
  ): Promise<TransactionSignature>;
  signMessage(
    message: Uint8Array,
    publicKey?: PublicKey | null
  ): Promise<Uint8Array>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

interface XnftContextState {
  backpack: BackpackWallet;
  setAppIframeElement: React.Dispatch<
    React.SetStateAction<HTMLIFrameElement | undefined>
  >;
}

const XnftContext = createContext<XnftContextState>({} as XnftContextState);

interface XnftContextProviderProps {
  children: ReactNode;
}

const IFRAME_ORIGIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3002"
    : "https://solana.playspokemon.xyz";

export default function XnftContextProvider({
  children,
}: XnftContextProviderProps) {
  const [backpack, setBackpack] = useState<BackpackWallet | undefined>();
  const [appIframeElement, setAppIframeElement] = useState<HTMLIFrameElement>();

  useEffect(function pollXnft() {
    function checkXnft() {
      const solana = window.xnft?.solana;
      if (solana?.publicKey) {
        setBackpack(solana);
        return;
      } else {
        setTimeout(checkXnft, 100);
      }
    }
    checkXnft();
  }, []);

  useEffect(
    function listenToWalletEvents() {
      const contentWindow = appIframeElement?.contentWindow;
      if (backpack && !!contentWindow) {
        const listener = async (event: MessageEvent<any>) => {
          if (event.origin !== IFRAME_ORIGIN) {
            return;
          }
          const { action, payload } = JSON.parse(event.data);

          switch (action) {
            case "signMessage":
              try {
                const signedMessage = await backpack.signMessage(
                  toUint8Array(payload)
                );
                contentWindow.postMessage(
                  JSON.stringify({
                    success: true,
                    payload: toBase64(signedMessage),
                  }),
                  IFRAME_ORIGIN
                );
              } catch (e) {
                if (e instanceof Error) {
                  contentWindow.postMessage(
                    JSON.stringify({
                      success: false,
                      payload:
                        /*e.message*/ "An error has occurred. Please try again.",
                    }),
                    IFRAME_ORIGIN
                  );
                }
              }
              break;
            case "signTransaction":
              try {
                const signedTransaction = await backpack.signTransaction(
                  Transaction.from(toUint8Array(payload))
                );
                contentWindow.postMessage(
                  JSON.stringify({
                    success: true,
                    payload: toBase64(
                      Uint8Array.from(signedTransaction.serialize())
                    ),
                  }),
                  IFRAME_ORIGIN
                );
              } catch (e) {
                if (e instanceof Error) {
                  contentWindow.postMessage(
                    JSON.stringify({
                      success: false,
                      payload:
                        /*e.message*/ "An error has occurred. Please try again.",
                    }),
                    IFRAME_ORIGIN
                  );
                }
              }
              break;
          }
        };
        window.addEventListener("message", listener);

        return () => {
          window.removeEventListener("message", listener);
        };
      }
    },
    [backpack, appIframeElement]
  );

  if (!backpack) {
    return null;
  }

  return (
    <XnftContext.Provider
      value={{
        backpack,
        setAppIframeElement,
      }}
    >
      {children}
    </XnftContext.Provider>
  );
}

export const useXnft = () => useContext(XnftContext);

const toBase64 = (uint8Array: Uint8Array) =>
  Buffer.from(uint8Array).toString("base64");

const toUint8Array = (data: string) => Buffer.from(data, "base64");
