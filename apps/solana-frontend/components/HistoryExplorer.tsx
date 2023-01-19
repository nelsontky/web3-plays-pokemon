import { ChangeEvent, useEffect, useState } from "react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import useGameHistory from "../hooks/useGameHistory";
import AppSlider from "./AppSlider";
import GameCanvas from "./GameCanvas";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton } from "@mui/material";
import HistoryParticipants from "./HistoryParticipants";
import MintButton from "./MintButton";
import { useRouter } from "next/router";
import ParticipationHistory from "./ParticipationHistory";
import useMediaQuery from "@mui/material/useMediaQuery";

const styles = {
  topContainer: tw`
    flex
    gap-4
  `,
  sliderContainer: tw`
    mt-8
    mb-2
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
  const isWide = useMediaQuery("(min-width:1024px)");
  const executedStatesCount = useAppSelector(
    (state) => state.gameData.executedStatesCount
  );
  const latestStateIndex = executedStatesCount - 1;
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.index === undefined) {
      router.replace(`/history?index=${latestStateIndex}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  const handleChange = (_: Event, newValue: number | number[]) => {
    router.replace(`/history?index=${newValue}`);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    if (!isNaN(value) && value <= latestStateIndex && value >= 0) {
      router.replace(`/history?index=${value}`);
    }
  };

  const stateIndex =
    typeof router.query.index === "string" ? +router.query.index : undefined;
  const history = useGameHistory(stateIndex);

  return (
    <div>
      <div css={styles.topContainer}>
        {isWide && <ParticipationHistory />}
        <GameCanvas framesImageData={history?.framesImageData} />
        {isWide && <MintButton stateIndex={stateIndex} history={history} />}
      </div>
      <div css={styles.sliderContainer}>
        {stateIndex !== undefined && (
          <AppSlider
            min={0}
            max={latestStateIndex}
            step={1}
            value={stateIndex}
            onChange={handleChange}
            css={styles.slider}
          />
        )}
      </div>
      <div css={styles.rounds}>
        Round:
        <IconButton
          disabled={stateIndex === 0}
          onClick={() => {
            if (stateIndex !== undefined) {
              router.replace(`/history?index=${stateIndex - 1}`);
            }
          }}
        >
          <RemoveIcon
            css={[tw`text-black`, stateIndex === 0 && tw`opacity-30`]}
          />
        </IconButton>
        {stateIndex !== undefined && (
          <input
            inputMode="numeric"
            size={10}
            css={styles.input}
            value={stateIndex}
            onChange={handleInputChange}
          />
        )}
        <IconButton
          disabled={stateIndex === latestStateIndex}
          onClick={() => {
            if (stateIndex !== undefined) {
              router.replace(`/history?index=${stateIndex + 1}`);
            }
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
      {!isWide && (
        <MintButton stateIndex={stateIndex} history={history} />
      )}
      <HistoryParticipants history={history} />
      {!isWide && <ParticipationHistory />}
    </div>
  );
}
