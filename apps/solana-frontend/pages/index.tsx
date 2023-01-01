import tw from "twin.macro";
import Controls from "../components/Controls";
import GameCanvas from "../components/GameCanvas";

export default function Web() {
  return (
    <div css={tw`max-w-2xl mx-auto px-4 pb-8`}>
      <GameCanvas />
      <Controls />
      {/* <VotesHistory /> */}
    </div>
  );
}
