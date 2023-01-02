import tw from "twin.macro";
import Controls from "../components/Controls";
import CurrentVotes from "../components/CurrentVotes";
import GameCanvas from "../components/GameCanvas";
import HowToPlay from "../components/How ToPlaySection";

export default function Web() {
  return (
    <div css={tw`max-w-2xl mx-auto px-4 pb-8`}>
      <GameCanvas />
      <Controls />
      <CurrentVotes />
      <HowToPlay />
    </div>
  );
}
