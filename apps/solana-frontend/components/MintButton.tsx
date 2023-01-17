import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";
import * as anchor from "@project-serum/anchor";

const styles = {
  button: tw`
    border-2
    border-black
    text-black
    text-2xl
    h-[48px]
    rounded
    px-10
  `,
};

interface MintButtonProps {
  stateIndex: number;
}

export default function MintButton({ stateIndex }: MintButtonProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  if (!publicKey) {
    return <AppWalletMultiButton />;
  }

  const onMint = async () => {
    try {
      console.log("loading");
      const response = await axios.post("/api/mint", {
        publicKey: publicKey.toBase58(),
        gameStateIndex: stateIndex,
      });

      const recoveredTransaction = anchor.web3.Transaction.from(
        Buffer.from(response.data.result, "base64")
      );
      await sendTransaction(recoveredTransaction, connection);
    } catch (e) {
      console.log(e);
    } finally {
      console.log("done");
    }
  };

  return (
    <button onClick={onMint} css={styles.button}>
      MINT
    </button>
  );
}
