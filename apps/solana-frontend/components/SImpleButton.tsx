import { MouseEventHandler, ReactNode } from "react";
import tw from "twin.macro";

const styles = {
  button: tw`
    block
    cursor-pointer
    mx-auto
    border-2
    border-black
    text-black
    text-2xl
    h-[48px]
    rounded
    px-10
  `,
  disabledButton: tw`
    cursor-default
    opacity-30
  `,
};

interface SimpleButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children?: ReactNode;
}

export default function SimpleButton({
  onClick,
  disabled,
  children,
}: SimpleButtonProps) {
  return (
    <button
      css={[styles.button, disabled && styles.disabledButton]}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}
