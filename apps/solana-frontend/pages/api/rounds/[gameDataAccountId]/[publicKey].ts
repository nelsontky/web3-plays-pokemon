import { PublicKey } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import nacl from "tweetnacl";
import { SIGNATURE_MESSAGE_FOR_ROUNDS } from "common";
import admin from "../../../../firebase/nodeApp";
import runCorsMiddleware from "../../../../utils/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await runCorsMiddleware(req, res);

    if (req.method !== "GET") {
      return res.status(404).end();
    }

    const { publicKey, gameDataAccountId } = req.query;
    const signature = req.headers.authorization;

    if (typeof signature !== "string" || !signature) {
      return res.status(401).end();
    }

    const isSignatureValid = nacl.sign.detached.verify(
      new TextEncoder().encode(SIGNATURE_MESSAGE_FOR_ROUNDS),
      Buffer.from(signature, "base64"),
      Uint8Array.from(new PublicKey(publicKey as string).toBuffer())
    );

    if (!isSignatureValid) {
      return res.status(401).end();
    }

    const result = await get(gameDataAccountId as string, publicKey as string);

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({
      message:
        "An unspecified error has occurred. Please refresh the page and try again.",
    });
  }
}

async function get(gameDataAccountId: string, publicKey: string) {
  const db = admin.database();
  const participantsRef = db.ref(
    `participants-${gameDataAccountId}/${publicKey}`
  );

  return new Promise((resolve, reject) => {
    participantsRef.once(
      "value",
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}
