import tw from "twin.macro";
import AppButton, { AppButtonProps } from "./AppButton";

const styles = {
  button: tw`
    min-[400px]:text-5xl
  `,
};

export default function ControlButton({ css, ...rest }: AppButtonProps) {
  return <AppButton css={[styles.button, css]} {...rest} />;
}
