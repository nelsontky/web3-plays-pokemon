import { VOTE_SECONDS } from "common";
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
  tableContainer: tw`
    flex
    flex-wrap
    justify-center
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
        <div css={styles.tableWrapper}>
          <table>
            <tbody>
              <tr>
                <th css={styles.textHeader}>Round</th>
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
                <td css={styles.tableData}>{executedStatesCount}</td>
                <td css={[styles.tableData, tw`max-w-[1rem]`]}>
                  {secondsLeft}
                </td>
                <td css={styles.tableData}>{currentState?.votes[1] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[2] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[3] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[4] ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div css={styles.tableWrapper}>
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
                <td css={styles.tableData}>{currentState?.votes[9] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[10] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[11] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[12] ?? 0}</td>
                <td css={styles.tableData}>{currentState?.votes[0] ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
