import { useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import tw from "twin.macro";
import { SIGNATURE_MESSAGE_FOR_ROUNDS } from "../constants";
import useTxSnackbar from "../hooks/useTxSnackbar";
import SimpleButton from "./SImpleButton";

const styles = {
  root: tw`
    flex-1
  `,
  header: tw`
    text-3xl
    mb-2
  `,
  text: tw`
    text-xl
  `,
  unloadedContainer: tw`
    flex
    h-full
    items-center
    justify-center
  `,
  participationHistoryContainer: tw`
    max-h-96
    overflow-y-auto
  `,
};

export default function ParticipationHistory() {
  const { signMessage, publicKey } = useWallet();
  const { enqueueSnackbar } = useTxSnackbar();
  const [walletSignature, setWalletSignature] = useState<string>();
  const [participatedRounds, setParticipatedRounds] = useState<
    number[] | undefined
  >();
  const [loading, setLoading] = useState(false);

  const fetchParticipationHistory = async () => {
    if (signMessage && publicKey) {
      let signatureToUse = walletSignature;
      if (!signatureToUse) {
        try {
          const signature = await signMessage(
            new TextEncoder().encode(SIGNATURE_MESSAGE_FOR_ROUNDS)
          );
          signatureToUse = Buffer.from(signature).toString("base64");
          setWalletSignature(signatureToUse);
        } catch (e) {
          if (e instanceof Error) {
            enqueueSnackbar(
              {
                title: e.message,
              },
              {
                variant: "error",
              }
            );
            return;
          }
        }

        try {
          setLoading(true);
          const response = await axios.get(
            `/api/rounds/${publicKey.toBase58()}`,
            {
              headers: {
                authorization: signatureToUse,
              },
            }
          );

          setParticipatedRounds(
            Object.keys(response.data).map((round) => +round)
          );
        } catch (e) {
          if (e instanceof AxiosError) {
            enqueueSnackbar(
              {
                title: e.message,
              },
              {
                variant: "error",
              }
            );
            return;
          }
        } finally {
          setLoading(false);
        }
      }
    } else {
      enqueueSnackbar(
        {
          title:
            "Wallet does not support message signing, please use Phantom wallet",
        },
        {
          variant: "error",
        }
      );
    }
  };

  if (!publicKey) {
    return <div css={styles.root} />;
  }

  return (
    <div css={styles.root}>
      {participatedRounds === undefined && !loading ? (
        <div css={styles.unloadedContainer}>
          <div>
            <SimpleButton onClick={fetchParticipationHistory}>
              Load History
            </SimpleButton>
            <p css={tw`text-center text-lg`}>Load participation history</p>
          </div>
        </div>
      ) : loading ? (
        <div css={styles.unloadedContainer}>
          <p css={tw`text-lg`}>Loading...</p>
        </div>
      ) : (
        <div>
          <h2 css={styles.header}>
            Participation History (
            {publicKey.toBase58().slice(0, 4) +
              ".." +
              publicKey.toBase58().slice(-4)}
            )
          </h2>
          <ul css={styles.participationHistoryContainer}>
            {participatedRounds?.map((round) => (
              <li css={styles.text} key={round}>
                Round {round}{" "}
                <Link
                  css={tw`underline`}
                  href={{ pathname: "/history", query: { index: round } }}
                >
                  (Jump)
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
