import dynamic from "next/dynamic";
import Head from "next/head";
import tw from "twin.macro";
import Controls from "../components/Controls";
import CurrentVotes from "../components/CurrentVotes";
import GameCanvas from "../components/GameCanvas";
import GameState from "../components/GameState";
import HowToPlay from "../components/HowToPlay";
import SocialLinks from "../components/SocialLinks";
import VotesHistory from "../components/VotesHistory";
import useMediaQuery from "@mui/material/useMediaQuery";

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
    max-w-3xl
    mx-auto

    xl:max-w-none
    xl:px-12
  `,
  section: tw`
    mx-auto

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

export default function Web() {
  const isWide = useMediaQuery("(min-width:1280px)");

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
        <div css={[styles.sectionsContainer, tw`hidden xl:flex`]}>
          <div css={styles.section}>
            <HowToPlay />
          </div>
          <div css={styles.section}>
            <GameCanvas />
            <CurrentVotes />
            <Controls />
            <VotesHistory />
          </div>
          <div css={styles.section}>
            <GameState />
          </div>
        </div>
      ) : (
        // Mobile
        <div css={[styles.sectionsContainer, tw`xl:hidden`]}>
          <div css={styles.section}>
            <GameCanvas />
            <CurrentVotes />
            <Controls />
          </div>
          <div css={styles.section}>
            <GameState />
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
