import tw from "twin.macro";
import SmallControl from "./SmallControl";
import { useAppSelector } from "../hooks/redux";
import { selectGameStateIds } from "../slices/gameStatesSlice";
import VotesHistoryRow from "./VotesHistoryRow";

const styles = {
  root: tw`
    mt-6
  `,
  header: tw`
    text-4xl
    text-center
    mb-4
  `,
  tableContainer: tw`
    overflow-x-auto
  `,
  table: tw`
    mx-auto
  `,
  textHeader: tw`
    px-1
  `,
};

export default function VotesHistory() {
  const gameStateIds = useAppSelector(selectGameStateIds);

  if (gameStateIds.length === 0) {
    return null;
  }

  return (
    <div css={styles.root}>
      {gameStateIds.length > 0 && <h1 css={styles.header}>Votes history</h1>}
      <div css={styles.tableContainer}>
        <table css={styles.table}>
          <tbody>
            <tr>
              <th css={styles.textHeader}>Round</th>
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
              <th>
                <SmallControl>Turbo ↑</SmallControl>
              </th>
              <th>
                <SmallControl>Turbo ↓</SmallControl>
              </th>
              <th>
                <SmallControl>Turbo ←</SmallControl>
              </th>
              <th>
                <SmallControl>Turbo →</SmallControl>
              </th>
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
              <th css={styles.textHeader}>Executed button</th>
            </tr>
            {/* skip first game state */}
            {gameStateIds.slice(1).map((id) => (
              <VotesHistoryRow key={id} gameStateId={id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
