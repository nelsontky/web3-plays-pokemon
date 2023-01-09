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

export const anchorEnumToJsEnum = (anchorEnum: { [button: string]: {} }) => {
  const button = Object.keys(anchorEnum)[0];

  switch (button) {
    case "up":
      return JoypadButton.Up;
    case "down":
      return JoypadButton.Down;
    case "left":
      return JoypadButton.Left;
    case "right":
      return JoypadButton.Right;
    case "a":
      return JoypadButton.A;
    case "b":
      return JoypadButton.B;
    case "start":
      return JoypadButton.Start;
    case "select":
      return JoypadButton.Select;
    default:
      return JoypadButton.Nothing;
  }
};

export const joypadEnumToButtonId = (joypadButton: JoypadButton) =>
  joypadButton === JoypadButton.Up
    ? 1
    : joypadButton === JoypadButton.Down
    ? 2
    : joypadButton === JoypadButton.Left
    ? 3
    : joypadButton === JoypadButton.Right
    ? 4
    : joypadButton === JoypadButton.TurboUp
    ? 5
    : joypadButton === JoypadButton.TurboDown
    ? 6
    : joypadButton === JoypadButton.TurboLeft
    ? 7
    : joypadButton === JoypadButton.TurboRight
    ? 8
    : joypadButton === JoypadButton.A
    ? 9
    : joypadButton === JoypadButton.B
    ? 10
    : joypadButton === JoypadButton.Start
    ? 11
    : joypadButton === JoypadButton.Select
    ? 12
    : 0;
