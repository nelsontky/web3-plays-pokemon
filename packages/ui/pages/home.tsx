import dynamic from "next/dynamic";
import Head from "next/head";
import tw from "twin.macro";
import Controls from "../components/Controls";
import CurrentVotes from "../components/CurrentVotes";
import GameState from "../components/GameState";
import HowToPlay from "../components/HowToPlay";
import SocialLinks from "../components/SocialLinks";
import VotesHistory from "../components/VotesHistory";
import useMediaQuery from "@mui/material/useMediaQuery";
import MainCanvas from "../components/MainCanvas";
import { useConfig } from "../contexts/ConfigProvider";

const ChatWidgetDynamic = dynamic(
  async () => await import("../components/ChatWidget"),
  {
    ssr: false,
  }
);

const DESCRIPTION = "Play Pokemon collaboratively on the Solana blockchain!";

const styles = {
  root: tw`
    px-4
    pb-8
    max-w-full
    mx-auto

    xl:max-w-none
    xl:px-12
  `,
  section: tw`
    mx-auto
    overflow-auto

    xl:grow 
    xl:w-1/3
  `,
  sectionsContainer: tw`
    flex-wrap
    flex 
    justify-center 
    gap-6

    xl:flex-nowrap
  `,
};

export default function Home() {
  const isWide = useMediaQuery("(min-width:1280px)");
  const { hideStats } = useConfig();

  return (
    <div css={styles.root}>
      <Head>
        <title>Solana Plays Pokemon</title>
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
      <SocialLinks />
      {isWide ? (
        // Desktop
        <div css={styles.sectionsContainer}>
          <div css={styles.section}>
            <HowToPlay />
          </div>
          <div css={styles.section}>
            <MainCanvas />
            <CurrentVotes />
            <Controls />
            {!hideStats && <VotesHistory />}
          </div>
          <div css={styles.section}>
            {hideStats ? <VotesHistory /> : <GameState />}
          </div>
        </div>
      ) : (
        // Mobile
        <div css={styles.sectionsContainer}>
          <div css={styles.section}>
            <MainCanvas />
            <CurrentVotes />
            <Controls />
          </div>
          <div css={styles.section}>
            {!hideStats && <GameState />}
            <HowToPlay id="how-to-play" />
          </div>
          <div css={styles.section}>
            <VotesHistory />
          </div>
        </div>
      )}

      <ChatWidgetDynamic />
    </div>
  );
}
