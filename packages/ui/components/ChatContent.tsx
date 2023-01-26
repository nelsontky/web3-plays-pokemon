import Chat, { Bubble, MessageProps } from "@chatui/core";
import "@chatui/core/dist/index.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction, useState } from "react";
import { SIGNATURE_MESSAGE } from "../constants";
import useReadMessages from "../hooks/useReadMessages";
import { Message } from "common";
import axios, { AxiosError } from "axios";
import tw from "twin.macro";
import useTxSnackbar from "../hooks/useTxSnackbar";
import ChatConnectWallet from "./ChatConnectWallet";
import { MAX_MESSAGE_LENGTH } from "common";

interface ChatContentProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatContent = ({ setOpen }: ChatContentProps) => {
  const { messages, loadMore } = useReadMessages();
  const [walletSignature, setWalletSignature] = useState<string>();
  const wallet = useWallet();
  const { enqueueSnackbar } = useTxSnackbar();

  const renderMessageContent = (message: MessageProps) => {
    const content: Message = message.content;
    return (
      <Bubble
        style={{
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <p
          css={tw`text-white opacity-50`}
          style={{
            marginBottom: 4,
          }}
        >
          {content.walletAddress.slice(0, 4) +
            ".." +
            content.walletAddress.slice(-4)}
        </p>
        <p css={tw`text-xl`}>{content.text}</p>
      </Bubble>
    );
  };

  const handleSend = async (_type: string, content: string) => {
    if (content.length > MAX_MESSAGE_LENGTH) {
      enqueueSnackbar(
        {
          title: "Message too long",
        },
        {
          variant: "error",
        }
      );

      return;
    }

    if (wallet.signMessage && wallet.publicKey) {
      let signatureToUse = walletSignature;
      if (!signatureToUse) {
        try {
          const signature = await wallet.signMessage(
            new TextEncoder().encode(SIGNATURE_MESSAGE)
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
      }

      try {
        await axios.post(
          "/api/messages",
          {
            publicKey: wallet.publicKey.toBase58(),
            text: content,
          },
          {
            headers: {
              authorization: signatureToUse,
            },
          }
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

  return (
    <Chat
      navbar={{
        title: "Live Chat",
        leftContent: {
          style: {
            borderRadius: "50%",
            padding: 8,
          },
          img: "/assets/close-button.png",
          onClick: () => {
            setOpen(false);
          },
        },
      }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
      placeholder="Message..."
      locale="en-US"
      loadMoreText="Load more"
      onRefresh={async () => {
        loadMore();
      }}
      Composer={
        !wallet?.publicKey
          ? () => <ChatConnectWallet setOpen={setOpen} />
          : undefined
      }
    />
  );
};

export default ChatContent;
