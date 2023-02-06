import tw from "twrnc";
import { useXnft } from "../contexts/XnftProvider";

export function HomeScreen() {
  const { backpack, setAppIframeElement } = useXnft();

  return (
    <iframe
      src={`${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3002"
          : "https://solana.playspokemon.xyz"
      }?publicKey=${encodeURIComponent(backpack.publicKey.toBase58())}`}
      style={tw`border-0 w-full h-full`}
      ref={(node) => {
        if (node) {
          setAppIframeElement(node);
        }
      }}
    />
  );
}
