import { BUTTON_ID_TO_ENUM, VOTE_SECONDS } from "common";
import { useEffect, useState } from "react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import { selectGameStateById } from "../slices/gameStatesSlice";
import SmallControl from "./SmallControl";

const styles = {
  root: tw`
    mt-6
  `,
  header: tw`
    text-4xl
    text-center
  `,
  timeLeft: tw`
    text-2xl
    leading-5
    text-center
`,
  buttonList: tw`
    flex
    flex-wrap
    items-start
  `,
  textHeader: tw`
    px-1
  `,
  roundText: tw`
    whitespace-nowrap 
    translate-y-3
  `,
  buttonPresses: tw`
    flex 
    gap-4 
    justify-center 
    min-h-[52px] 
    mt-4`,
};

export default function CurrentVotes() {
  const executedStatesCount = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );
  const currentState = useAppSelector((state) =>
    selectGameStateById(state, executedStatesCount)
  );
  const hasButtonPresses =
    currentState && currentState.buttonPresses.length > 0;

  const [secondsLeft, setSecondsLeft] = useState<string>("0");
  useEffect(
    function updateTimer() {
      const calcSecondsLeft = () => {
        const secondsLeft = currentState
          ? VOTE_SECONDS -
            (Math.floor(Date.now() / 1000) - currentState.createdAt)
          : VOTE_SECONDS;
        setSecondsLeft(secondsLeft > 0 ? secondsLeft + "s" : "0s");
      };

      const timer = setInterval(calcSecondsLeft, 500);
      calcSecondsLeft();

      return () => {
        clearInterval(timer);
      };
    },
    [currentState]
  );

  return (
    <div css={[!currentState && tw`invisible`, styles.root]}>
      <h2 css={styles.header}>Time left for round {executedStatesCount}</h2>
      <p css={styles.timeLeft}>{secondsLeft}</p>
      <p
        css={[
          styles.timeLeft,
          tw`invisible underline`,
          secondsLeft === "0s" && tw`visible`,
        ]}
      >
        Please send in one last button for the game to proceed
      </p>
      <div css={styles.buttonPresses}>
        <div css={[styles.roundText, !hasButtonPresses && tw`invisible`]}>
          Buttons to execute:
        </div>
        <div css={styles.buttonList}>
          {currentState?.buttonPresses.map((buttonId, i) => (
            <SmallControl key={i}>{BUTTON_ID_TO_ENUM[buttonId]}</SmallControl>
          ))}
        </div>
      </div>
    </div>
  );
}
