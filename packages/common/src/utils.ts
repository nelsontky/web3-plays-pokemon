import { JoypadButton } from "./enums";

export function computeButtonVotes(currentGameState: any) {
  const {
    upCount,
    downCount,
    leftCount,
    rightCount,
    aCount,
    bCount,
    startCount,
    selectCount,
    nothingCount,
  } = currentGameState;
  const maxCount = Math.max(
    upCount,
    downCount,
    leftCount,
    rightCount,
    aCount,
    bCount,
    startCount,
    selectCount,
    nothingCount
  );
  let joypadButton: JoypadButton;
  switch (maxCount) {
    case upCount:
      joypadButton = JoypadButton.Up;
      break;
    case downCount:
      joypadButton = JoypadButton.Down;
      break;
    case leftCount:
      joypadButton = JoypadButton.Left;
      break;
    case rightCount:
      joypadButton = JoypadButton.Right;
      break;
    case aCount:
      joypadButton = JoypadButton.A;
      break;
    case bCount:
      joypadButton = JoypadButton.B;
      break;
    case startCount:
      joypadButton = JoypadButton.Start;
      break;
    case selectCount:
      joypadButton = JoypadButton.Select;
      break;
    default:
      joypadButton = JoypadButton.Nothing;
  }

  return joypadButton;
}
