import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosError } from "axios";
import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";
import * as anchor from "@project-serum/anchor";
import type { History } from "../slices/historySlice";
import { useEffect, useRef, useState } from "react";
import { GAME_DATA_ACCOUNT_PUBLIC_KEY } from "../constants";
import { useReadonlyProgram } from "../hooks/useProgram";
import useTxSnackbar from "../hooks/useTxSnackbar";
import { SnackbarKey } from "notistack";

const styles = {
  root: tw`
    flex
    justify-center
    mt-8
  `,
  button: tw`
    block
    cursor-pointer
    mx-auto
    border-2
    border-black
    text-black
    text-2xl
    h-[48px]
    rounded
    px-10
  `,
  disabledButton: tw`
    cursor-default
    opacity-30
  `,
  explainer: tw`
    text-lg
    text-center
  `,
};

interface MintButtonProps {
  stateIndex: number | undefined;
  history: History | undefined;
}

export default function MintButton({ stateIndex, history }: MintButtonProps) {
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
      if (stateIndex !== undefined && history !== undefined) {
        const userIsParticipant = history.participants.some(
          (participant) => participant.signer === publicKey?.toBase58()
        );
        setIsParticipant(userIsParticipant);
      }
    },
    [history, publicKey, stateIndex]
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
              GAME_DATA_ACCOUNT_PUBLIC_KEY.toBuffer(),
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

  if (stateIndex === undefined || history === undefined) {
    return null;
  }

  if (!publicKey) {
    return (
      <div css={styles.root}>
        <div>
          <AppWalletMultiButton
            style={{
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <p css={styles.explainer}>
            Connect your wallet to check if you are able to mint this round as
            an NFT!
          </p>
        </div>
      </div>
    );
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
      const response = await axios.post("/api/mint", {
        publicKey: publicKey.toBase58(),
        gameStateIndex: stateIndex,
      });
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
      const txId = await sendTransaction(recoveredTransaction, connection);

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
        <button
          onClick={isButtonDisabled ? undefined : onMint}
          css={[styles.button, isButtonDisabled && styles.disabledButton]}
        >
          MINT NFT
        </button>
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
