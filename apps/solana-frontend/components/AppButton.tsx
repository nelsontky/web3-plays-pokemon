import { useState } from "react";
import tw from "twin.macro";

const styles = {
  container: tw`
    relative
    inline-block
  `,
  button: tw`
    relative
    bg-white
    border-2
    border-black
    py-1
    px-6
    whitespace-nowrap
    select-none
  `,
  background: tw`
    bg-black
    absolute
    inset-2
    w-full
    h-full
  `,
};

export interface AppButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  css?: any;
}

export default function AppButton({
  children,
  onClick,
  css,
  ...rest
}: AppButtonProps) {
  const [isMouseDown, setIsMouseDown] = useState(false);

  return (
    <div css={styles.container}>
      <div css={styles.background} />
      <button
        css={[styles.button, css]}
        style={{
          ...(isMouseDown ? { transform: "translate(4px, 4px)" } : {}),
        }}
        onClick={onClick}
        onMouseDown={() => {
          setIsMouseDown(true);
        }}
        onMouseUp={() => {
          setTimeout(() => {
            setIsMouseDown(false);
          }, 100);
        }}
        onMouseLeave={() => {
          setIsMouseDown(false);
        }}
        {...rest}
      >
        {children}
      </button>
    </div>
  );
}
