import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";

const styles = {
  root: tw`
    h-20
    px-8
    flex
    justify-center
  `,
  inner: tw`
    container
    flex
    items-center
    justify-between
    grow
  `,
  header: tw`
    invisible
    text-4xl
    sm:visible
  `,
};

export default function AppBar() {
  return (
    <div css={styles.root}>
      <div css={styles.inner}>
        <h1 css={styles.header}>Solana Plays Pokemon</h1>
        <AppWalletMultiButton />
      </div>
    </div>
  );
}
