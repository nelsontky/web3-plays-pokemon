import { ChangeEvent, useState } from "react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import useGameHistory from "../hooks/useGameHistory";
import AppSlider from "./AppSlider";
import GameCanvas from "./GameCanvas";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton } from "@mui/material";
import HistoryParticipants from "./HistoryParticipants";

const styles = {
  sliderContainer: tw`
    mt-8
    flex
    justify-center
  `,
  slider: tw`
    w-11/12
  `,
  rounds: tw`
    text-4xl
    flex
    gap-3
    justify-center
    items-center
  `,
  input: tw`
    border-2
    border-black
    outline-0
    text-center
  `,
};

export default function HistoryExplorer() {
  const executedStatesCount = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );
  const latestStateIndex = executedStatesCount - 1;
  const [stateIndex, setStateIndex] = useState(latestStateIndex);

  const handleChange = (_: Event, newValue: number | number[]) => {
    setStateIndex(newValue as number);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (!isNaN(value) && value <= latestStateIndex && value >= 0) {
      setStateIndex(value);
    }
  };

  const history = useGameHistory(stateIndex);

  return (
    <div>
      <GameCanvas framesImageData={history?.framesImageData} />
      <div css={styles.sliderContainer}>
        <AppSlider
          min={0}
          max={latestStateIndex}
          step={1}
          value={stateIndex}
          onChange={handleChange}
          css={styles.slider}
        />
      </div>
      <div css={styles.rounds}>
        Round:
        <IconButton
          disabled={stateIndex === 0}
          onClick={() => {
            setStateIndex((stateIndex) => stateIndex - 1);
          }}
        >
          <RemoveIcon
            css={[tw`text-black`, stateIndex === 0 && tw`opacity-30`]}
          />
        </IconButton>
        <input
          inputMode="numeric"
          size={10}
          css={styles.input}
          value={stateIndex}
          onChange={handleInputChange}
        />
        <IconButton
          disabled={stateIndex === latestStateIndex}
          onClick={() => {
            setStateIndex((stateIndex) => stateIndex + 1);
          }}
        >
          <AddIcon
            css={[
              tw`text-black`,
              stateIndex === latestStateIndex && tw`opacity-30`,
            ]}
          />
        </IconButton>
      </div>
      <HistoryParticipants history={history} />
    </div>
  );
}
