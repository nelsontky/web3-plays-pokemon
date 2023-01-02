import { CSSProperties } from "react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import {
  selectGameStateById,
  selectGameStateIds,
} from "../slices/gameStatesSlice";
import SmallControl from "./SmallControl";

const styles = {
  root: tw`
    flex
    justify-center
  `,
  veryWideCount: tw`
    w-[90px]
    text-center
  `,
  wideCount: tw`
    w-[78px]
    text-center
  `,
  textButtonCount: tw`
    w-[68px]
    text-center
  `,
  mediumCount: tw`
    w-[42px]
    text-center  
  `,
  narrowCount: tw`
    w-[29px]
    text-center
  `,
  tableHeader: tw`
    flex
    items-center
    justify-center
  `,
  textHeader: tw`
    px-1
    whitespace-nowrap
  `,
};

interface VotesHistoryRowProps {
  index: number;
  style: CSSProperties;
}

export default function VotesHistoryRow({
  index,
  ...rest
}: VotesHistoryRowProps) {
  const gameStateIds = useAppSelector(selectGameStateIds);
  const gameState = useAppSelector((state) =>
    selectGameStateById(state, gameStateIds[index - 1])
  );

  if (index === 0) {
    return <TableHeader {...rest} />;
  }

  if (index - 1 === 0 || !gameState) {
    return null;
  }

  return (
    <div {...rest} css={styles.root}>
      <div css={styles.wideCount}>{gameState.second}</div>
      <div css={styles.narrowCount}>{gameState.upCount}</div>
      <div css={styles.narrowCount}>{gameState.downCount}</div>
      <div css={styles.mediumCount}>{gameState.leftCount}</div>
      <div css={styles.mediumCount}>{gameState.rightCount}</div>
      <div css={styles.narrowCount}>{gameState.aCount}</div>
      <div css={styles.narrowCount}>{gameState.bCount}</div>
      <div css={styles.textButtonCount}>{gameState.startCount}</div>
      <div css={styles.textButtonCount}>{gameState.selectCount}</div>
      <div css={styles.textButtonCount}>{gameState.nothingCount}</div>
      <div css={styles.veryWideCount}>
        <SmallControl
          containerStyles={{
            transform: "scale(0.6) translateY(-0.7rem)",
          }}
        >
          {gameState.executedButton}
        </SmallControl>
      </div>
    </div>
  );
}

const TableHeader = (props: { style: CSSProperties }) => (
  <div css={styles.tableHeader} {...props}>
    <p css={styles.textHeader}>Game second</p>
    <SmallControl>↑</SmallControl>
    <SmallControl>↓</SmallControl>
    <SmallControl>←</SmallControl>
    <SmallControl>→</SmallControl>
    <SmallControl>A</SmallControl>
    <SmallControl>B</SmallControl>
    <SmallControl>START</SmallControl>
    <SmallControl>SELECT</SmallControl>
    <SmallControl>DO NOTHING</SmallControl>
    <p css={styles.textHeader}>Executed button</p>
  </div>
);
