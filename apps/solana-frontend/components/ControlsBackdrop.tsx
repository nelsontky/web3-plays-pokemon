import Backdrop from "@mui/material/Backdrop";
import { useWallet } from "@solana/wallet-adapter-react";
import tw from "twin.macro";
import { useAppSelector } from "../hooks/redux";
import AppWalletMultiButton from "./AppWalletMultiButton";
import CircularProgress from "@mui/material/CircularProgress";
import { computeButtonVotes, JoypadButton } from "common";
import SmallControl from "./SmallControl";
import {
  selectGameStateById,
  selectGameStateIds,
} from "../slices/gameStatesSlice";

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
  const joypadButton = currentGameState
    ? computeButtonVotes(currentGameState)
    : JoypadButton.Nothing;

  switch (joypadButton) {
    case JoypadButton.Up:
      return <SmallControl>↑</SmallControl>;
    case JoypadButton.Down:
      return <SmallControl>↓</SmallControl>;
    case JoypadButton.Left:
      return <SmallControl>←</SmallControl>;
    case JoypadButton.Right:
      return <SmallControl>→</SmallControl>;
    case JoypadButton.A:
      return <SmallControl>A</SmallControl>;
    case JoypadButton.B:
      return <SmallControl>B</SmallControl>;
    case JoypadButton.Start:
      return <SmallControl>START</SmallControl>;
    case JoypadButton.Select:
      return <SmallControl>SELECT</SmallControl>;
    default:
      return <SmallControl>DO NOTHING</SmallControl>;
  }
};
