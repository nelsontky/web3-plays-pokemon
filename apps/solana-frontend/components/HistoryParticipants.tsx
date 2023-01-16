import useMediaQuery from "@mui/material/useMediaQuery";
import tw from "twin.macro";
import type { History } from "../slices/historySlice";

const styles = {
  root: tw`
    flex
    justify-center
    mt-8
  `,
  header: tw`
    text-3xl
    text-center
  `,
  row: tw`
    mb-4
  `,
  text: tw`
    text-2xl
  `,
};

interface HistoryParticipantsProps {
  history: History | undefined;
}

export default function HistoryParticipants({
  history,
}: HistoryParticipantsProps) {
  const isNarrow = useMediaQuery("(max-width:600px)");

  if (!history) {
    return null;
  }

  return (
    <div css={styles.root}>
      <div>
        <h2 css={styles.header}>Participants</h2>
        {history.participants.map((participant) => (
          <div key={participant.txHash} css={styles.row}>
            <div css={tw`flex gap-2 items-center`}>
              <p css={styles.text}>
                {isNarrow
                  ? participant.signer.slice(0, 4) +
                    ".." +
                    participant.signer.slice(-4)
                  : participant.signer}
              </p>
              <span css={tw`text-xl`}>
                &#40;
                <a
                  css={tw`underline`}
                  href={`https://solscan.io/tx/${participant.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Details
                </a>
                &#41;
              </span>
            </div>
            <p css={styles.text}>
              {new Date(participant.blockTime * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
