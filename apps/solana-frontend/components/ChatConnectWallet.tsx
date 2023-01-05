import { Dispatch, SetStateAction } from "react";
import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";

const styles = {
  root: tw`
    flex 
    flex-col
    items-center 
    p-3 
    border-t-4
    border-black
    text-center
  `,
  text: tw`
    text-lg 
    leading-none
    mt-2
  `,
};

export default function ChatConnectWallet({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div css={styles.root}>
      <AppWalletMultiButton
        onClick={() => {
          setOpen(false);
        }}
      />
      <p css={styles.text}>Connect your Solana wallet to send messages</p>
      <p css={tw`leading-none`}>
        WARNING: Watch out for scams and beware of any links sent in the chat.
      </p>
    </div>
  );
}
