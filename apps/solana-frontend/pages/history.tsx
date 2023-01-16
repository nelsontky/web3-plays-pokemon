import tw from "twin.macro";
import HistoryExplorer from "../components/HistoryExplorer";
import { useAppSelector } from "../hooks/redux";

const styles = {
  root: tw`
    px-4
    pb-8
    w-full
    mx-auto
    grow

    xl:px-12
  `,
  loadingContainer: tw`
    relative
    w-full
    h-full
  `,
  loadingText: tw`
    absolute
    top-1/2
    left-1/2
    -translate-x-1/2
    -translate-y-1/2
  `,
};

export default function History() {
  const gameDataStatus = useAppSelector((state) => state.gameData.status);

  return (
    <div css={styles.root}>
      {gameDataStatus !== "succeeded" ? (
        <div css={styles.loadingContainer}>
          <p css={styles.loadingText}>Loading...</p>
        </div>
      ) : (
        <HistoryExplorer />
      )}
    </div>
  );
}
