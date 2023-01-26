import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(404).end();
    }

    const { cid } = req.query;

    const response = await Promise.any([
      axios.get(`https://${cid}.ipfs.cf-ipfs.com`, {
        responseType: "arraybuffer",
      }),
      axios.get(`https://${cid}.ipfs.nftstorage.link/`, {
        responseType: "arraybuffer",
      }),
      axios.get(`https://${cid}.ipfs.w3s.link/`, {
        responseType: "arraybuffer",
      }),
    ]);

    res.send(response.data);
  } catch {
    res.status(500).end();
  }
}
