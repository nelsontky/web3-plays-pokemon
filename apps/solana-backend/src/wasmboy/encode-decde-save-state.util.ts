import { SaveStateDecoded, SaveStateEncoded } from "./save-state.interface";

export const decodeSaveState = (
  saveState: SaveStateEncoded,
): SaveStateDecoded => ({
  gameboyMemory: Buffer.from(saveState.gameboyMemory).toString("base64"),
  paletteMemory: Buffer.from(saveState.paletteMemory).toString("base64"),
  wasmboyState: Buffer.from(saveState.wasmboyState).toString("base64"),
});

export const encodeSaveState = (
  saveState: SaveStateDecoded,
): SaveStateEncoded => ({
  gameboyMemory: new Uint8Array(Buffer.from(saveState.gameboyMemory, "base64")),
  paletteMemory: new Uint8Array(Buffer.from(saveState.paletteMemory, "base64")),
  wasmboyState: new Uint8Array(Buffer.from(saveState.wasmboyState, "base64")),
});
