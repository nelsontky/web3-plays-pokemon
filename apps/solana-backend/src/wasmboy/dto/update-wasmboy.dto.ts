import { IsEnum } from "class-validator";
import { JoypadButton } from "common";

export class UpdateWasmboyDto {
  @IsEnum(JoypadButton)
  readonly joypadButton: JoypadButton;
}
