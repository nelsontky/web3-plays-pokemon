import tw from "twin.macro";
import AppButton, { AppButtonProps } from "./AppButton";

interface SmallControlProps extends AppButtonProps {}

const SmallControl = ({
  children,
  containerStyles,
  ...rest
}: SmallControlProps) => (
  <AppButton
    containerStyles={{
      transform: "scale(0.6)",
      ...containerStyles,
    }}
    css={tw`px-3`}
    disabled
    {...rest}
  >
    {children}
  </AppButton>
);

export default SmallControl;
