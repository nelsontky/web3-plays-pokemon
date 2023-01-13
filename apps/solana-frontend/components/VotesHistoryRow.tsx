import { EntityId } from "@reduxjs/toolkit";
import { BUTTON_ID_TO_ENUM, MAX_BUTTONS_PER_ROUND } from "common";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import { selectGameStateById } from "../slices/gameStatesSlice";
import SmallControl from "./SmallControl";

const styles = {
  tableData: tw`
    text-center
    w-[60px]
    relative
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
      <td>{gameStateId}</td>
      {Array.from({ length: MAX_BUTTONS_PER_ROUND }, (_, i) => {
        const button = gameState?.buttonPresses[i];
        if (button === undefined) {
          return <td key={i} css={styles.tableData} />;
        }
        return (
          <td key={i} css={styles.tableData}>
            <SmallControl>{BUTTON_ID_TO_ENUM[button]}</SmallControl>
          </td>
        );
      })}
    </tr>
  );
}
