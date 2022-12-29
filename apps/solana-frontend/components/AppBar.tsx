import dynamic from "next/dynamic";
import tw from "twin.macro";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

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
        <WalletMultiButtonDynamic
          style={{
            border: "4px solid #000000",
            color: "#000000",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}
