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

export const jsEnumToAnchorEnum = (joypadButton: JoypadButton) => {
  switch (joypadButton) {
    case JoypadButton.Up:
      return { up: {} };
    case JoypadButton.Down:
      return { down: {} };
    case JoypadButton.Left:
      return { left: {} };
    case JoypadButton.Right:
      return { right: {} };
    case JoypadButton.A:
      return { a: {} };
    case JoypadButton.B:
      return { b: {} };
    case JoypadButton.Start:
      return { start: {} };
    case JoypadButton.Select:
      return { select: {} };
    default:
      return { nothing: {} };
  }
};
