import { useEffect, useState } from "react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import { selectGameStateById } from "../slices/gameStatesSlice";
import SmallControl from "./SmallControl";

const VOTE_SECONDS = 10;

const styles = {
  root: tw`
    mt-6
  `,
  header: tw`
    text-4xl
    text-center
  `,
  tableContainer: tw`
    flex
    flex-wrap
    justify-center
    items-start
  `,
  tableData: tw`
    text-center
    align-top
  `,
  textHeader: tw`
    px-1
  `,
};

export default function CurrentVotes() {
  const secondsPlayed = useAppSelector((state) => state.gameData.secondsPlayed);
  const currentState = useAppSelector((state) =>
    selectGameStateById(state, secondsPlayed)
  );

  const [secondsLeft, setSecondsLeft] = useState<string>("0");
  useEffect(() => {
    const calcSecondsLeft = () => {
      const secondsLeft = currentState
        ? VOTE_SECONDS -
          (Math.floor(Date.now() / 1000) - currentState.createdAt)
        : VOTE_SECONDS;
      setSecondsLeft(
        secondsLeft > 0
          ? secondsLeft + "s"
          : "Next button will be the last vote"
      );
    };

    const timer = setInterval(calcSecondsLeft, 500);
    calcSecondsLeft();

    return () => {
      clearInterval(timer);
    };
  }, [currentState]);

  return (
    <div css={styles.root}>
      <h2 css={styles.header}>Current votes</h2>
      <div css={styles.tableContainer}>
        <table>
          <tbody>
            <tr>
              <th css={styles.textHeader}>Game second</th>
              <th css={styles.textHeader}>Time left to vote</th>
              <th>
                <SmallControl>↑</SmallControl>
              </th>
              <th>
                <SmallControl>↓</SmallControl>
              </th>
              <th>
                <SmallControl>←</SmallControl>
              </th>
              <th>
                <SmallControl>→</SmallControl>
              </th>
            </tr>
            <tr>
              <td css={styles.tableData}>{secondsPlayed}</td>
              <td css={[styles.tableData, tw`max-w-[1rem] leading-none`]}>
                {secondsLeft}
              </td>
              <td css={styles.tableData}>{currentState?.upCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.downCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.leftCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.rightCount ?? 0}</td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th>
                <SmallControl>A</SmallControl>
              </th>
              <th>
                <SmallControl>B</SmallControl>
              </th>
              <th>
                <SmallControl>START</SmallControl>
              </th>
              <th>
                <SmallControl>SELECT</SmallControl>
              </th>
              <th>
                <SmallControl>DO NOTHING</SmallControl>
              </th>
            </tr>
            <tr>
              <td css={styles.tableData}>{currentState?.aCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.bCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.startCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.selectCount ?? 0}</td>
              <td css={styles.tableData}>{currentState?.nothingCount ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
