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

const ChatWidgetDynamic = dynamic(
  async () => await import("../components/ChatWidget"),
  {
    ssr: false,
  }
);

const DESCRIPTION = "Play Pokemon collaboratively on the Solana blockchain!";

export default function Web() {
  return (
    <div css={tw`px-4 pb-8`}>
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
      <div css={tw`flex justify-center flex-wrap gap-6`}>
        <div css={tw`max-w-2xl`}>
          <GameCanvas />
          <CurrentVotes />
          <Controls />
          <HowToPlay />
        </div>
        <GameState />
      </div>
      <VotesHistory />
      <ChatWidgetDynamic />
    </div>
  );
}
