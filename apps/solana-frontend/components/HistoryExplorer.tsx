import { ChangeEvent, useState } from "react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import AppSlider from "./AppSlider";

const styles = {
  rounds: tw`
    text-center
    text-3xl
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
  const [stateIndex, setStateIndex] = useState(executedStatesCount - 1);

  const handleChange = (_: Event, newValue: number | number[]) => {
    setStateIndex(newValue as number);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (!isNaN(value) && value < executedStatesCount && value >= 0) {
      setStateIndex(value);
    }
  };

  return (
    <div>
      <AppSlider
        min={0}
        max={executedStatesCount - 1}
        step={1}
        value={stateIndex}
        onChange={handleChange}
      />
      <div css={styles.rounds}>
        Round:{" "}
        <input
          inputMode="numeric"
          size={10}
          css={styles.input}
          value={stateIndex}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
