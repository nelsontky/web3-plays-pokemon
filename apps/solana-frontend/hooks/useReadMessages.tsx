import { useCallback, useEffect, useRef } from "react";
import { createFirebaseApp } from "../firebase/clientApp";
import {
  getDatabase,
  limitToLast,
  query,
  ref,
  onChildAdded,
  startAfter,
  endAt,
  get,
  endBefore,
  orderByChild,
} from "firebase/database";
import Message from "../types/message";
import { useMessages } from "@chatui/core";
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

      const newestMessageRef = query(ref(db, "solana"), limitToLast(1));
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

  const loadMore = async () => {
    const app = createFirebaseApp();
    const db = getDatabase(app);

    if (messages[0]) {
      const moreMessagesQuery = query(
        ref(db, "solana"),
        orderByChild("timestamp"),
        endBefore(messages[0].content.timestamp),
        limitToLast(LOAD_COUNT)
      );

      const snapshot = await get(moreMessagesQuery);

      if (!!snapshot.val()) {
        let newestTimeStamp = 0;
        const results = Object.entries(snapshot.val()).map(([id, message]) => {
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
