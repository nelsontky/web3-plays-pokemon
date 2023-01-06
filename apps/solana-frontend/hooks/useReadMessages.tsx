import { useEffect, useRef } from "react";
import { createFirebaseApp } from "../firebase/clientApp";
import {
  collection,
  query,
  onSnapshot,
  getFirestore,
  orderBy,
  limit,
  where,
  getDocs,
} from "firebase/firestore";
import Message from "../types/message";
import { useMessages } from "@chatui/core";
import { useWallet } from "@solana/wallet-adapter-react";

const LOAD_COUNT = 20;

export default function useReadMessages() {
  const { messages, appendMsg, resetList, prependMsgs } = useMessages([]);
  const { publicKey } = useWallet();
  const newestTimeStampRef = useRef<number>(0);

  useEffect(
    function listen() {
      const app = createFirebaseApp();
      const db = app ? getFirestore(app) : getFirestore();

      const recentMessagesQuery = query(
        collection(db, "solana"),
        orderBy("timestamp", "desc"),
        limit(LOAD_COUNT)
      );

      const unsubscribe = onSnapshot(recentMessagesQuery, (snapshot) => {
        snapshot
          .docChanges()
          .reverse()
          .forEach((change) => {
            const id = change.doc.id;
            const { walletAddress, text, timestamp } =
              change.doc.data() as Message;

            if (change.type === "added") {
              const hasTime =
                timestamp > newestTimeStampRef.current + 60 * 1000;
              if (hasTime) {
                newestTimeStampRef.current = timestamp;
              }

              appendMsg({
                _id: id,
                type: "text",
                content: { walletAddress, text, timestamp },
                createdAt: timestamp,
                hasTime,
                position:
                  publicKey?.toBase58() === walletAddress ? "right" : "left",
              });
            }
          });
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
    const db = app ? getFirestore(app) : getFirestore();

    if (messages[0]) {
      const moreMessagesQuery = query(
        collection(db, "solana"),
        where("timestamp", "<", messages[0].content.timestamp),
        orderBy("timestamp", "desc"),
        limit(LOAD_COUNT)
      );
      const querySnapshot = await getDocs(moreMessagesQuery);
      let newestTimeStamp = 0;
      prependMsgs(
        querySnapshot.docs.reverse().map((doc) => {
          const id = doc.id;
          const { walletAddress, text, timestamp } = doc.data() as Message;

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
              publicKey?.toBase58() === walletAddress ? "right" : "left",
          };
        })
      );
    }
  };

  return { messages, loadMore };
}
