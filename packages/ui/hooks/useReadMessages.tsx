import { useEffect, useRef } from "react";
import { createFirebaseApp } from "../firebase/clientApp";
import {
  getDatabase,
  limitToLast,
  query,
  ref,
  onChildAdded,
  get,
  endBefore,
  orderByChild,
} from "firebase/database";
import { Message } from "common";
import { useMessages, MessageProps } from "@chatui/core";
import { useWallet } from "@solana/wallet-adapter-react";

const LOAD_COUNT = 5;

export default function useReadMessages() {
  const { messages, appendMsg, resetList, prependMsgs } = useMessages([]);
  const { publicKey } = useWallet();
  const newestTimeStampRef = useRef<number>(0);

  useEffect(
    function listen() {
      const app = createFirebaseApp();
      const db = getDatabase(app);

      const newestMessageRef = query(
        ref(db, process.env.NEXT_PUBLIC_MESSAGES_COLLECTION),
        orderByChild("timestamp"),
        limitToLast(1)
      );
      const unsubscribe = onChildAdded(newestMessageRef, (snapshot) => {
        const _id = snapshot.key;
        const { text, timestamp, walletAddress } = snapshot.val() as Message;

        const hasTime = timestamp > newestTimeStampRef.current + 60 * 1000;
        if (hasTime) {
          newestTimeStampRef.current = timestamp;
        }

        if (_id !== null) {
          appendMsg({
            _id,
            type: "text",
            content: { walletAddress, text, timestamp },
            createdAt: timestamp,
            hasTime,
            position:
              publicKey?.toBase58() === walletAddress ? "right" : "left",
          });
        }
      });

      return () => {
        newestTimeStampRef.current = 0;
        unsubscribe();
        resetList();
      };
    },
    [appendMsg, publicKey, resetList]
  );

  const messagesRef = useRef<MessageProps[]>([]);
  useEffect(
    function updateMessagesRef() {
      messagesRef.current = messages;
    },
    [messages]
  );
  const loadMore = async () => {
    const app = createFirebaseApp();
    const db = getDatabase(app);

    if (messagesRef.current[0]) {
      const moreMessagesQuery = query(
        ref(db, process.env.NEXT_PUBLIC_MESSAGES_COLLECTION),
        orderByChild("timestamp"),
        endBefore(messagesRef.current[0].content.timestamp),
        limitToLast(LOAD_COUNT)
      );

      const snapshot = await get(moreMessagesQuery);

      if (!!snapshot.val()) {
        let newestTimeStamp = 0;
        const results = Object.entries(snapshot.val())
          .sort((a: any, b: any) => a[1].timestamp - b[1].timestamp)
          .map(([id, message]) => {
            const { walletAddress, text, timestamp } = message as Message;
            const hasTime = timestamp > newestTimeStamp + 60 * 1000;
            if (hasTime) {
              newestTimeStamp = timestamp;
            }

            return {
              _id: id,
              type: "text",
              content: { walletAddress, text, timestamp },
              createdAt: timestamp,
              hasTime,
              position:
                publicKey?.toBase58() === walletAddress
                  ? "right"
                  : ("left" as any),
            };
          });
        prependMsgs(results);
      }
    }
  };

  return { messages, loadMore };
}
