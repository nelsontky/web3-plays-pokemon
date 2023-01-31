import { IconButton } from "@mui/material";
import { OptionsObject, useSnackbar } from "notistack";
import { useCallback } from "react";
import tw from "twin.macro";
import CloseIcon from "@mui/icons-material/Close";

const styles = {
  root: tw`
    max-w-[230px]
  `,
  title: tw`
    text-xl
  `,
  errorMessage: tw`
    whitespace-nowrap
    text-ellipsis
    overflow-hidden
  `,
  txLink: tw`
    underline
  `,
};

interface AppSnackbarMessage {
  title: string;
  txId?: string;
  errorMessage?: string;
}

export default function useTxSnackbar() {
  const { enqueueSnackbar: enqueueSnackbarBase, closeSnackbar } = useSnackbar();

  const enqueueSnackbar = useCallback(
    (
      { title, txId, errorMessage }: AppSnackbarMessage,
      options?: OptionsObject
    ) => {
      const toastId = enqueueSnackbarBase(
        <div css={styles.root}>
          <h1 css={styles.title}>{title}</h1>
          {errorMessage && (
            <p title={errorMessage} css={styles.errorMessage}>
              {errorMessage}
            </p>
          )}
          {txId && (
            <a
              css={styles.txLink}
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction
            </a>
          )}
        </div>,
        {
          ...options,
          ...(options?.variant === "success" || options?.variant === "error"
            ? {
                action: (snackbarId) => (
                  <IconButton
                    onClick={() => {
                      closeSnackbar(snackbarId);
                    }}
                    size="small"
                  >
                    <CloseIcon fontSize="small" css={tw`text-black`} />
                  </IconButton>
                ),
              }
            : {}),
        }
      );

      return toastId;
    },
    [closeSnackbar, enqueueSnackbarBase]
  );

  return { enqueueSnackbar, closeSnackbar };
}
