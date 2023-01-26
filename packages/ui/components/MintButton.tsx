import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosError } from "axios";
import tw from "twin.macro";
import * as anchor from "@project-serum/anchor";
import type { History } from "../slices/historySlice";
import { useEffect, useState } from "react";
import { useReadonlyProgram } from "../hooks/useProgram";
import useTxSnackbar from "../hooks/useTxSnackbar";
import { SnackbarKey } from "notistack";
import SimpleButton from "./SImpleButton";
import { useConfig } from "../contexts/ConfigProvider";

const styles = {
  root: tw`
    mt-8
    lg:mt-0
    flex
    justify-center
    items-center
    flex-1
  `,
  explainer: tw`
    text-lg
    text-center
  `,
};

interface MintButtonProps {
  stateIndex: number | undefined;
  history: History | undefined;
  css?: any;
}

export default function MintButton({ stateIndex, history }: MintButtonProps) {
  const { gameDataAccountPublicKey } = useConfig();
  const { enqueueSnackbar, closeSnackbar } = useTxSnackbar();
  const program = useReadonlyProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isParticipant, setIsParticipant] = useState<boolean | undefined>(
    undefined
  );
  const [hasMintedBefore, setHasMintedBefore] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(
    function checkIfIsParticipant() {
      setIsParticipant(undefined);
      const isDevnet = connection.rpcEndpoint.includes("solana-devnet");

      if (isDevnet) {
        setIsParticipant(true);
      } else if (stateIndex !== undefined && history !== undefined) {
        const userIsParticipant = history.participants.some(
          (participant) => participant.signer === publicKey?.toBase58()
        );
        setIsParticipant(userIsParticipant);
      }
    },
    [connection.rpcEndpoint, history, publicKey, stateIndex]
  );

  useEffect(
    function checkHasMintedBefore() {
      setHasMintedBefore(undefined);
      (async () => {
        if (stateIndex !== undefined && publicKey !== null) {
          let hasUnmounted = false;

          const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
            [
              Buffer.from("nft_mint"),
              gameDataAccountPublicKey.toBuffer(),
              publicKey.toBuffer(),
              Buffer.from("" + stateIndex),
            ],
            program.programId
          );

          const accountInfo = await connection.getAccountInfo(mint);
          if (!hasUnmounted) {
            setHasMintedBefore(accountInfo !== null);
          }

          return () => {
            hasUnmounted = true;
          };
        }
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connection, publicKey, stateIndex]
  );

  if (!publicKey) {
    return <div css={styles.root} />;
  }

  const onMint = async () => {
    let snackbarId: SnackbarKey | undefined = undefined;

    try {
      setLoading(true);

      snackbarId = enqueueSnackbar(
        {
          title: "Setting up transaction",
        },
        {
          variant: "info",
          autoHideDuration: null,
        }
      );
      const response = await axios.post(
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/mint"
          : "https://solana.playspokemon.xyz/api/mint",
        {
          publicKey: publicKey.toBase58(),
          gameStateIndex: stateIndex,
          gameDataAccountId: gameDataAccountPublicKey.toBase58(),
        }
      );
      closeSnackbar(snackbarId);
      snackbarId = enqueueSnackbar(
        {
          title: "Sending transaction",
        },
        {
          variant: "info",
          autoHideDuration: null,
        }
      );
      const recoveredTransaction = anchor.web3.Transaction.from(
        Buffer.from(response.data.result, "base64")
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const txId = await sendTransaction(recoveredTransaction, connection);
      await connection.confirmTransaction({
        blockhash: blockhash,
        lastValidBlockHeight,
        signature: txId,
      });

      enqueueSnackbar(
        {
          title: "Success",
          txId,
        },
        {
          variant: "success",
        }
      );

      setHasMintedBefore(true);
    } catch (e) {
      if (e instanceof AxiosError && e.response) {
        enqueueSnackbar(
          {
            title: "Error",
            errorMessage: e.response.data.result,
          },
          {
            variant: "error",
          }
        );
      } else if (e instanceof Error) {
        enqueueSnackbar(
          {
            title: "Error",
            errorMessage: e.message,
          },
          {
            variant: "error",
          }
        );
      }
    } finally {
      setLoading(false);
      if (snackbarId !== undefined) {
        closeSnackbar(snackbarId);
      }
    }
  };

  const isButtonDisabled = Boolean(
    loading ||
      !isParticipant ||
      hasMintedBefore ||
      hasMintedBefore === undefined
  );
  return (
    <div css={styles.root}>
      <div>
        <SimpleButton
          disabled={isButtonDisabled}
          onClick={onMint}
          css={tw`mx-auto`}
        >
          MINT NFT
        </SimpleButton>
        <p css={styles.explainer}>
          {history?.participants.length === 0
            ? "Refresh the page after 1 minute to check if you can mint this round"
            : isParticipant === undefined ||
              (isParticipant && hasMintedBefore === undefined)
            ? "Loading..."
            : isParticipant === false
            ? "Ineligible for mint as your wallet did not participate in this round :'("
            : hasMintedBefore
            ? "Your wallet minted this round before!"
            : loading
            ? "Minting your NFT... This might take up to 1 minute please do not leave the page!"
            : "You are eligible for mint :)"}
        </p>
      </div>
    </div>
  );
}
