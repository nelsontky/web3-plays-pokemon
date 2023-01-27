import { JoypadButton } from "./enums";

export const GAMEBOY_CAMERA_WIDTH = 160;
export const GAMEBOY_CAMERA_HEIGHT = 144;
export const GAMEBOY_FPS = 60;

export const FRAMES_TO_DRAW_PER_EXECUTION = 30;
export const MAX_BUTTONS_PER_ROUND = 10; // cannot be more than half of FRAMES_TO_DRAW_PER_EXECUTION
export const NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS = 5;
export const MAX_MESSAGE_LENGTH = 2200;

export const VOTE_SECONDS = 10;

export const BUTTON_ID_TO_ENUM = [
  JoypadButton.Nothing,
  JoypadButton.Up,
  JoypadButton.Down,
  JoypadButton.Left,
  JoypadButton.Right,
  JoypadButton.TurboUp,
  JoypadButton.TurboDown,
  JoypadButton.TurboLeft,
  JoypadButton.TurboRight,
  JoypadButton.A,
  JoypadButton.B,
  JoypadButton.Start,
  JoypadButton.Select,
  JoypadButton.TurboA,
  JoypadButton.TurboB,
];

export const SIGNATURE_MESSAGE = `Verify to chat.\n\nClicking "Sign" or "Approve" only means you have proved this wallet is owned by you.\n\nThis request will not trigger any blockchain transactions or generate a fee.`;
export const SIGNATURE_MESSAGE_FOR_ROUNDS = `Verify to load data.\n\nClicking "Sign" or "Approve" only means you have proved this wallet is owned by you.\n\nThis request will not trigger any blockchain transactions or generate a fee.`;
export const POKEMON_PIXEL_FONT = {
  style: { fontColor: "black" },
  className: "pokemon-pixel-font",
};

// Mainnet
export const PROGRAM_ID = "pkmNUoVrc8m4DkvQkKDHrffDEPJwVhuXqQv3hegbVyg";
export const GAME_DATA_AUTHORITY =
  "ash1JcmhS3mNXm7gowst3pfSCsr3Sg33bQZ555vsw1i";

export const GAME_DATA_ACCOUNT_ID =
  "redHPYj5C9X7TyEqQPHMTsfevKZ9eHCTQ8BJVee9JWC";
export const V2_GAME_DATA_ACCOUNT_ID =
  "CrYStLQ1Uv1RXhXF7sZ1kTYRBi5NXmcRHQRSVR8wHkNR";

export const GAME_DATAS: Record<string, true> = {
  [GAME_DATA_ACCOUNT_ID]: true,
  [V2_GAME_DATA_ACCOUNT_ID]: true,
};
export const GAME_DATA_COLLECTION_IDS: Record<string, string> = {
  [GAME_DATA_ACCOUNT_ID]: "pkmA56jwkhZWJYXFB8RbKju8kgFhw4fTYahp9VXPQdw",
  [V2_GAME_DATA_ACCOUNT_ID]: "pkmUxqUBPrCWguhL6f9SwkVEYeJqzPAptFZwBD84LyP",
};
export const GAME_DATA_ROM_NAME: Record<string, string> = {
  [GAME_DATA_ACCOUNT_ID]:
    "Pokemon - Red Version (USA, Europe) (SGB Enhanced).gb",
  [V2_GAME_DATA_ACCOUNT_ID]:
    "Pokemon - Crystal Version (USA, Europe) (Rev 1).gbc",
};

// Devnet
// export const PROGRAM_ID = "pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK";
// export const GAME_DATA_AUTHORITY =
//   "ashAJB3SoHhrX5ppXgDCELsmjyhZiV4GtBtLKB8F8wx";

// export const GAME_DATA_ACCOUNT_ID =
//   "redRuipyQy8cMUuLaGuriaeE3khPNGZpM9PRsq3zFqv";
// export const V2_GAME_DATA_ACCOUNT_ID =
//   "CrYst3WnhMxkdR7sJGXuZVMtH2tGhfdtKzisggMYGcJb";

// export const GAME_DATAS: Record<string, true> = {
//   [GAME_DATA_ACCOUNT_ID]: true,
//   [V2_GAME_DATA_ACCOUNT_ID]: true,
// };
// export const GAME_DATA_COLLECTION_IDS: Record<string, string> = {
//   [GAME_DATA_ACCOUNT_ID]: "pkmZnQzR1zzWFsNTvQ7G1r2keHrcpkbvprQ4954TzAN",
//   [V2_GAME_DATA_ACCOUNT_ID]: "pkmC9fdyURE4DsCyvfLtAwivTTX1tofr3mGCnkSyfUM",
// };
// export const GAME_DATA_ROM_NAME: Record<string, string> = {
//   [GAME_DATA_ACCOUNT_ID]:
//     "Pokemon - Red Version (USA, Europe) (SGB Enhanced).gb",
//   [V2_GAME_DATA_ACCOUNT_ID]:
//     "Pokemon - Crystal Version (USA, Europe) (Rev 1).gbc",
// };
