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
  tableContainer: tw`
    mt-4
    flex
    flex-wrap
    items-start
  `,
  tableWrapper: tw`
    min-h-[72px]
  `,
  tableData: tw`
    text-center
    align-top
    leading-none
  `,
  textHeader: tw`
    px-1
  `,
};

export default function CurrentVotes() {
  const executedStatesCount = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );
  const currentState = useAppSelector((state) =>
    selectGameStateById(state, executedStatesCount)
  );

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
    <div css={styles.root}>
      <h2 css={styles.header}>Time left</h2>
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
      <div css={tw`flex items-center gap-4 justify-center`}>
        <div css={tw`whitespace-nowrap translate-y-3`}>
          Round {executedStatesCount}:
        </div>
        <div css={styles.tableContainer}>
          {currentState?.buttonPresses.map((buttonId, i) => {
            return (
              <SmallControl key={i}>{BUTTON_ID_TO_ENUM[buttonId]}</SmallControl>
            );
          })}
        </div>
      </div>
    </div>
  );
}
