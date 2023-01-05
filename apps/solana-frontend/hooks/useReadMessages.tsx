import { useEffect, useState } from "react";
import { createFirebaseApp } from "../firebase/clientApp";
import {
  collection,
  query,
  onSnapshot,
  getFirestore,
  orderBy,
  limit,
} from "firebase/firestore";
import Message from "../types/message";
import { useMessages } from "@chatui/core";
import { useWallet } from "@solana/wallet-adapter-react";

const INITIAL_COUNT = 3;

export default function useReadMessages() {
  const { messages, appendMsg, resetList } = useMessages([]);
  const { publicKey } = useWallet();

  useEffect(
    function listen() {
      const app = createFirebaseApp();
      const db = app ? getFirestore(app) : getFirestore();

      const recentMessagesQuery = query(
        collection(db, "solana"),
        orderBy("timestamp", "desc"),
        limit(INITIAL_COUNT)
      );

      const unsubscribe = onSnapshot(recentMessagesQuery, (snapshot) => {
        snapshot
          .docChanges()
          .reverse()
          .forEach((change) => {
            const { walletAddress, text, timestamp } =
              change.doc.data() as Message;

            if (change.type === "added") {
              appendMsg({
                type: "text",
                content: { walletAddress, text, timestamp },
                position:
                  publicKey?.toBase58() === walletAddress ? "right" : "left",
              });
            }
          });
      });

      return () => {
        unsubscribe();
        resetList();
      };
    },
    [appendMsg, publicKey, resetList]
  );

  return messages;
}
