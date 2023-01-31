import { SUPPORTED_SPL_TOKENS } from "common";

export default function getIsValidSplMint(splMint: string | undefined) {
  if (splMint === undefined) {
    return true;
  }

  return !!SUPPORTED_SPL_TOKENS[splMint];
}
