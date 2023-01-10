import { JoypadButton } from "./enums";

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
    : joypadButton === JoypadButton.TurboA
    ? 13
    : joypadButton === JoypadButton.TurboB
    ? 14
    : 0;
