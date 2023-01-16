import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";
import Link from "next/link";

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
  return (
    <div css={styles.root}>
      <div css={styles.inner}>
        <Link href="/" css={styles.header}>
          Solana Plays Pokemon
        </Link>
        <div css={tw`flex gap-4 items-center`}>
          <button
            css={tw`xl:hidden underline text-xl cursor-pointer`}
            onClick={() => {
              document.getElementById("how-to-play")?.scrollIntoView();
            }}
          >
            How to play
          </button>
          <Link css={tw`underline text-xl`} href="/history">
            History
          </Link>
          <AppWalletMultiButton />
        </div>
      </div>
    </div>
  );
}
