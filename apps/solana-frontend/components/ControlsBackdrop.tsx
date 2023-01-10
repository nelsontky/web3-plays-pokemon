import Backdrop from "@mui/material/Backdrop";
import { useWallet } from "@solana/wallet-adapter-react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import AppWalletMultiButton from "./AppWalletMultiButton";
import CircularProgress from "@mui/material/CircularProgress";
import { BUTTON_ID_TO_ENUM } from "common";
import SmallControl from "./SmallControl";
import {
  selectGameStateById,
  selectGameStateIds,
} from "../slices/gameStatesSlice";
import { useMemo } from "react";

const styles = {
  root: tw`
    absolute
    w-full
    h-full
    flex
    justify-center
    items-center
    z-10
    bg-white/95
    p-2
  `,
};

export default function ControlsBackdrop() {
  const isExecuting = useAppSelector((state) => state.gameData.isExecuting);
  const { publicKey } = useWallet();
  const gameStateIds = useAppSelector(selectGameStateIds);
  const newestId = gameStateIds[0];
  const currentGameState = useAppSelector((state) =>
    selectGameStateById(state, newestId)
  );

  const open = isExecuting || publicKey === null;

  return (
    <Backdrop open={open} css={styles.root}>
      {publicKey === null ? (
        <div>
          <AppWalletMultiButton
            style={{
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <p css={tw`text-lg`}>Connect your Solana wallet to start playing!</p>
        </div>
      ) : (
        <div css={tw`text-center`}>
          <CircularProgress css={tw`text-black`} />
          <div css={tw`text-lg`}>
            Voting for this round has ended. Executing
            <MoveButton currentGameState={currentGameState} /> ...
          </div>
        </div>
      )}
    </Backdrop>
  );
}

const MoveButton = ({ currentGameState }: { currentGameState: any }) => {
  const executedButton = useMemo(() => {
    const votes = currentGameState?.votes;

    if (!votes) {
      return;
    }

    let maxVoteCount = Number.MIN_SAFE_INTEGER;
    let executedButton = 0;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i] > maxVoteCount) {
        maxVoteCount = votes[i];
        executedButton = i;
      }
    }

    return executedButton;
  }, [currentGameState]);

  if (executedButton === undefined) {
    return null;
  }

  return <SmallControl>{BUTTON_ID_TO_ENUM[executedButton]}</SmallControl>;
};
