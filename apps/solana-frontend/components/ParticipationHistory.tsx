import { useWallet } from "@solana/wallet-adapter-react";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { SIGNATURE_MESSAGE_FOR_ROUNDS } from "../constants";
import useTxSnackbar from "../hooks/useTxSnackbar";

export default function ParticipationHistory() {
  const { signMessage, publicKey } = useWallet();
  const { enqueueSnackbar } = useTxSnackbar();
  const [walletSignature, setWalletSignature] = useState<string>();

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
          await axios.get(`/api/rounds/${publicKey.toBase58()}`, {
            headers: {
              authorization: signatureToUse,
            },
          });
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

  return null;
}
