import tw from "twin.macro";
import AppWalletMultiButton from "./AppWalletMultiButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@mui/material/useMediaQuery";

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
    md:justify-between
    grow
  `,
  header: tw`
    text-xl
    underline
    mr-4
    md:text-4xl
    md:no-underline
  `,
};

interface AppBarProps {
  title: string;
}

export default function AppBar({ title }: AppBarProps) {
  const isWide = useMediaQuery("(min-width:768px)");
  const router = useRouter();
  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(
    function hideHowToPlay() {
      if (router.isReady && router.pathname === "/history") {
        setIsHomePage(false);
      } else {
        setIsHomePage(true);
      }
    },
    [router.isReady, router.pathname]
  );

  return (
    <div css={styles.root}>
      <div css={styles.inner}>
        <Link
          href={{
            pathname: "/",
            query: {
              ...(router.query?.publicKey
                ? { publicKey: router.query.publicKey }
                : {}),
            },
          }}
          css={styles.header}
        >
          {isWide ? title : !isHomePage ? "Home" : ""}
        </Link>
        <div css={tw`flex gap-4 items-center`}>
          {isHomePage && (
            <button
              css={tw`hidden sm:block xl:hidden underline text-xl cursor-pointer`}
              onClick={() => {
                document.getElementById("how-to-play")?.scrollIntoView();
              }}
            >
              How to play
            </button>
          )}
          <Link
            css={tw`underline text-xl`}
            href={{ pathname: "/history", query: router.query }}
          >
            History
          </Link>
          <AppWalletMultiButton />
        </div>
      </div>
    </div>
  );
}
