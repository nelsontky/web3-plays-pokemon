import { JoypadButton } from "./enums";

export const GAMEBOY_CAMERA_WIDTH = 160;
export const GAMEBOY_CAMERA_HEIGHT = 144;
export const GAMEBOY_FPS = 60;
export const GAMEBOY_MEMORY_OFFSET = 0x8000;
export const FRAMES_TO_DRAW_PER_EXECUTION = 30;
export const NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS = 2;

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
];

// Mainnet
export const PROGRAM_ID = "pkmNUoVrc8m4DkvQkKDHrffDEPJwVhuXqQv3hegbVyg";
export const GAME_DATA_ACCOUNT_ID =
  "redHPYj5C9X7TyEqQPHMTsfevKZ9eHCTQ8BJVee9JWC";

// Devnet
// export const PROGRAM_ID = "pkmJNXmUxFT1bmmCp4DgvCm2LxR3afRtCwV1EzQwEHK";
// export const GAME_DATA_ACCOUNT_ID =
//   "redFxqfCk6MBYgLa81jKjU2uZn4F4VGLNwCHYg2SURZ";
