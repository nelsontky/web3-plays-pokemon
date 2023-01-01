import tw from "twin.macro";
import AppButton from "./AppButton";

const SmallControl = ({ children }: { children: React.ReactNode }) => (
  <AppButton
    containerStyles={{
      transform: "scale(0.6)",
    }}
    css={tw`px-3`}
    disabled
  >
    {children}
  </AppButton>
);

export default SmallControl;
