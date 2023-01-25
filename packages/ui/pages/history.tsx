import Head from "next/head";
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

const DESCRIPTION =
  "Throwback to the moves made during this collaborative game of Pokemon on the Solana blockchain!";

export default function History() {
  const gameDataStatus = useAppSelector((state) => state.gameData.status);

  return (
    <div css={styles.root}>
      <Head>
        <title>History</title>
        <meta name="description" content={DESCRIPTION} key="desc" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/og-image.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
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
