import { MouseEventHandler, ReactNode } from "react";
import tw from "twin.macro";

const styles = {
  button: tw`
    block
    cursor-pointer
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
  css?: any;
}

export default function SimpleButton({
  onClick,
  disabled,
  children,
  css,
  ...rest
}: SimpleButtonProps) {
  return (
    <button
      css={[styles.button, disabled && styles.disabledButton, css]}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
