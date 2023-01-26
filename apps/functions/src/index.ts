import * as functions from "firebase-functions";
import mintHandler from "./handlers/mint";

export const mint = functions.https.onRequest(mintHandler);
