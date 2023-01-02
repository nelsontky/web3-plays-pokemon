import tw from "twin.macro";
import SmallControl from "./SmallControl";

const styles = {
  root: tw`
    mt-6
  `,
  header: tw`
    text-4xl
    text-center
  `,
  table: tw`
    overflow-x-auto
  `,
  tableHeader: tw`
    mt-4
    flex
    items-center
  `,
  textHeader: tw`
    px-1
    whitespace-nowrap
  `,
};

export default function VotesHistory() {
  return (
    <div css={styles.root}>
      <h1 css={styles.header}>Votes history</h1>
      <div css={styles.table}>
        <div css={styles.tableHeader}>
          <p css={[styles.textHeader, tw`ml-auto`]}>Game second</p>
          <p css={styles.textHeader}>Time left to vote</p>
          <SmallControl>↑</SmallControl>
          <SmallControl>↓</SmallControl>
          <SmallControl>←</SmallControl>
          <SmallControl>→</SmallControl>
          <SmallControl>A</SmallControl>
          <SmallControl>B</SmallControl>
          <SmallControl>START</SmallControl>
          <SmallControl>SELECT</SmallControl>
          <SmallControl
            containerStyles={{
              marginRight: "auto",
            }}
          >
            DO NOTHING
          </SmallControl>
        </div>
      </div>
    </div>
  );
}
