import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";

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
        <h1 css={styles.header}>Solana Plays Pokemon</h1>
        <div css={tw`flex gap-4 items-center`}>
          <button
            css={tw`xl:hidden underline text-xl cursor-pointer`}
            onClick={() => {
              document.getElementById("how-to-play")?.scrollIntoView();
            }}
          >
            How to play
          </button>
          <AppWalletMultiButton />
        </div>
      </div>
    </div>
  );
}
