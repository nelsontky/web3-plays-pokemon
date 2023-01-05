import Chat, { Bubble, MessageProps } from "@chatui/core";
import "@chatui/core/dist/index.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { SIGNATURE_MESSAGE } from "../constants";
import useReadMessages from "../hooks/useReadMessages";
import Message from "../types/message";
import axios from "axios";

const ChatContent = () => {
  const messages = useReadMessages();
  const [walletSignature, setWalletSignature] = useState<string>();
  const wallet = useWallet();

  const renderMessageContent = (message: MessageProps) => {
    const content: Message = message.content;
    return <Bubble content={content.text} />;
  };

  const handleSend = async (_type: string, content: string) => {
    if (wallet.signMessage && wallet.publicKey) {
      let signatureToUse = walletSignature;
      if (!signatureToUse) {
        const signature = await wallet.signMessage(
          new TextEncoder().encode(SIGNATURE_MESSAGE)
        );
        signatureToUse = Buffer.from(signature).toString("base64");
        setWalletSignature(signatureToUse);
      }

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
    }
  };

  return (
    <Chat
      navbar={{ title: "Live Chat" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
      placeholder="Message..."
      locale="en-US"
      loadMoreText="Load more"
    />
  );
};

export default ChatContent;
