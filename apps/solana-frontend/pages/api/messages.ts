import type { NextApiRequest, NextApiResponse } from "next";
import type { Message } from "common";
import admin from "../../firebase/nodeApp";
import nacl from "tweetnacl";
import { SIGNATURE_MESSAGE } from "common";
import { PublicKey } from "@solana/web3.js";
import { MAX_MESSAGE_LENGTH } from "common";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(404).end();
    }

    const { publicKey, text }: { publicKey?: string; text?: string } = req.body;
    const signature = req.headers.authorization;
    if (!signature || !publicKey) {
      return res.status(401).end();
    }

    if (text === undefined || text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).end();
    }

    const isSignatureValid = nacl.sign.detached.verify(
      new TextEncoder().encode(SIGNATURE_MESSAGE),
      Buffer.from(signature, "base64"),
      Uint8Array.from(new PublicKey(publicKey).toBuffer())
    );

    if (!isSignatureValid) {
      return res.status(401).end();
    }

    const trimmedText = text?.trim();
    if (!trimmedText || trimmedText.length === 0) {
      return res.status(400).end();
    }

    await create({
      text: trimmedText,
      timestamp: Date.now(),
      walletAddress: publicKey,
    });

    return res.status(200).end();
  } catch {
    return res.status(500).end();
  }
}

async function create(message: Message) {
  const db = admin.database();
  const solanaMessagesCollection = db.ref("solana");
  return new Promise((resolve, reject) => {
    solanaMessagesCollection.push(message, (error) => {
      if (error !== null) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}
