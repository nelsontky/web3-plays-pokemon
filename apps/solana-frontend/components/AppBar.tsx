import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const styles = {
  root: tw`
    min-h-[5rem]
    px-4
    flex
    justify-center

    xl:px-12
  `,
  inner: tw`
    flex
    items-center
    justify-end
    sm:justify-between
    grow
  `,
  header: tw`
    hidden
    text-4xl
    sm:block
  `,
};

export default function AppBar() {
  const router = useRouter();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(
    function hideHowToPlay() {
      if (router.isReady && router.pathname === "/history") {
        setShowHowToPlay(false);
      } else {
        setShowHowToPlay(true);
      }
    },
    [router.isReady, router.pathname]
  );

  return (
    <div css={styles.root}>
      <div css={styles.inner}>
        <Link href="/" css={styles.header}>
          Solana Plays Pokemon
        </Link>
        <div css={tw`flex gap-4 items-center`}>
          {showHowToPlay && (
            <button
              css={tw`xl:hidden underline text-xl cursor-pointer`}
              onClick={() => {
                document.getElementById("how-to-play")?.scrollIntoView();
              }}
            >
              How to play
            </button>
          )}
          <Link css={tw`underline text-xl`} href="/history">
            History
          </Link>
          <AppWalletMultiButton />
        </div>
      </div>
    </div>
  );
}
