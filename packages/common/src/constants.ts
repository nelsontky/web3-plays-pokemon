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

// Mainnet
export const PROGRAM_ID = "pkmNUoVrc8m4DkvQkKDHrffDEPJwVhuXqQv3hegbVyg";
export const GAME_DATA_ACCOUNT_ID =
  "redHPYj5C9X7TyEqQPHMTsfevKZ9eHCTQ8BJVee9JWC";
export const GAME_DATA_AUTHORITY =
  "ash1JcmhS3mNXm7gowst3pfSCsr3Sg33bQZ555vsw1i";
export const COLLECTION_ID = "pkmA56jwkhZWJYXFB8RbKju8kgFhw4fTYahp9VXPQdw";

// Devnet
// export const PROGRAM_ID = "pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK";
// export const GAME_DATA_ACCOUNT_ID =
//   "redRuipyQy8cMUuLaGuriaeE3khPNGZpM9PRsq3zFqv";
// export const GAME_DATA_AUTHORITY =
//   "ashAJB3SoHhrX5ppXgDCELsmjyhZiV4GtBtLKB8F8wx";
// export const COLLECTION_ID = "pkmZnQzR1zzWFsNTvQ7G1r2keHrcpkbvprQ4954TzAN";
