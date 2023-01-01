import { css } from "@emotion/react";
import { SnackbarProvider } from "notistack";
import CircularProgress from "@mui/material/CircularProgress";
import tw from "twin.macro";

const styles = css({
  background: "#ffffff",
});

export default function AppSnackBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      classes={{
        root: "custom-snackbar-root",
      }}
      maxSnack={2}
      iconVariant={{
        info: (
          <CircularProgress
            css={tw`text-black`}
            style={{
              width: 20,
              height: 20,
            }}
          />
        ),
      }}
    >
      {children}
    </SnackbarProvider>
  );
}
