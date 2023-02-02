import dynamic from "next/dynamic";
import { CSSProperties } from "react";
import { POKEMON_PIXEL_FONT } from "../constants";
import { useConfig } from "../contexts/ConfigProvider";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function AppWalletMultiButton({
  style,
}: {
  style?: CSSProperties;
}) {
  const { isXnft } = useConfig();

  return (
    <WalletMultiButtonDynamic
      {...(isXnft ? { disabled: true } : {})}
      style={{
        border: "2px solid #000000",
        color: "#000000",
        background: "transparent",
        fontSize: "1.5rem",
        whiteSpace: "nowrap",
        ...POKEMON_PIXEL_FONT.style,
        ...style,
      }}
    />
  );
}
