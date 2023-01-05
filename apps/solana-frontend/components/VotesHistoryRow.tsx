import { EntityId } from "@reduxjs/toolkit";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import { selectGameStateById } from "../slices/gameStatesSlice";
import SmallControl from "./SmallControl";

const styles = {
  tableData: tw`
    text-center
    align-top
  `,
};

interface VotesHistoryRowProps {
  gameStateId: EntityId;
}

export default function VotesHistoryRow({ gameStateId }: VotesHistoryRowProps) {
  const gameState = useAppSelector((state) =>
    selectGameStateById(state, gameStateId)
  );

  if (!gameState) {
    return null;
  }

  return (
    <tr>
      <td css={styles.tableData}>{gameState.index}</td>
      <td css={styles.tableData}>{gameState.upCount}</td>
      <td css={styles.tableData}>{gameState.downCount}</td>
      <td css={styles.tableData}>{gameState.leftCount}</td>
      <td css={styles.tableData}>{gameState.rightCount}</td>
      <td css={styles.tableData}>{gameState.aCount}</td>
      <td css={styles.tableData}>{gameState.bCount}</td>
      <td css={styles.tableData}>{gameState.startCount}</td>
      <td css={styles.tableData}>{gameState.selectCount}</td>
      <td css={styles.tableData}>{gameState.nothingCount}</td>
      <td css={styles.tableData}>
        <SmallControl
          containerStyles={{
            transform: "scale(0.6) translateY(-1rem)",
          }}
        >
          {gameState.executedButton}
        </SmallControl>
      </td>
    </tr>
  );
}
