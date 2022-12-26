import tw from "twin.macro";
import Controls from "../components/Controls";

export default function Web() {
  return (
    <div css={tw`container mx-auto px-4`}>
      <Controls />
    </div>
  );
}
