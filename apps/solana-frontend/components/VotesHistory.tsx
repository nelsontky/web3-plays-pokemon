import tw from "twin.macro";
import SmallControl from "./SmallControl";
import { FixedSizeList } from "react-window";
import { useAppSelector } from "../hooks/redux";
import { selectGameStateIds } from "../slices/gameStatesSlice";
import AutoSizer from "react-virtualized-auto-sizer";
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
  table: tw`
    overflow-x-auto
  `,
};

const ROW_HEIGHT = 32;

export default function VotesHistory() {
  const gameStateIds = useAppSelector(selectGameStateIds);

  return (
    <div css={styles.root}>
      {gameStateIds.length > 0 && <h1 css={styles.header}>Votes history</h1>}
      <div css={styles.table}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <FixedSizeList
              width={width}
              height={ROW_HEIGHT * (gameStateIds.length + 1)}
              itemSize={ROW_HEIGHT}
              itemCount={gameStateIds.length}
            >
              {VotesHistoryRow}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}
