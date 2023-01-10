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
      <td css={styles.tableData}>{gameState.votes[1]}</td>
      <td css={styles.tableData}>{gameState.votes[2]}</td>
      <td css={styles.tableData}>{gameState.votes[3]}</td>
      <td css={styles.tableData}>{gameState.votes[4]}</td>
      <td css={styles.tableData}>{gameState.votes[5]}</td>
      <td css={styles.tableData}>{gameState.votes[6]}</td>
      <td css={styles.tableData}>{gameState.votes[7]}</td>
      <td css={styles.tableData}>{gameState.votes[8]}</td>
      <td css={styles.tableData}>{gameState.votes[9]}</td>
      <td css={styles.tableData}>{gameState.votes[10]}</td>
      <td css={styles.tableData}>{gameState.votes[13]}</td>
      <td css={styles.tableData}>{gameState.votes[14]}</td>
      <td css={styles.tableData}>{gameState.votes[11]}</td>
      <td css={styles.tableData}>{gameState.votes[12]}</td>
      <td css={styles.tableData}>{gameState.votes[0]}</td>
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
