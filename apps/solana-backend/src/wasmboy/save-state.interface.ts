export interface SaveStateEncoded {
  gameboyMemory: Uint8Array;
  paletteMemory: Uint8Array;
  wasmboyState: Uint8Array;
}

export interface SaveStateDecoded {
  gameboyMemory: string;
  paletteMemory: string;
  wasmboyState: string;
}
