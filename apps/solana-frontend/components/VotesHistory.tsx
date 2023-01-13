import tw from "twin.macro";
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
    max-w-2xl
    mx-auto
  `,
};

export default function VotesHistory() {
  const gameStateIds = useAppSelector(selectGameStateIds);

  if (gameStateIds.length === 0) {
    return null;
  }

  return (
    <div css={styles.root}>
      {gameStateIds.length > 0 && <h1 css={styles.header}>History</h1>}
      <div css={styles.tableContainer}>
        <table>
          <tbody>
            <tr>
              <th>Round</th>
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
