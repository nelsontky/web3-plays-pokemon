import tw from "twin.macro";

const styles = {
  root: tw`
    mt-6
  `,
  header: tw`
    text-4xl
    text-center
  `,
  text: tw`
    text-2xl
    mt-4
    text-justify
  `,
};

export default function HowToPlay() {
  return (
    <div css={styles.root} id="how-to-play">
      <h1 css={styles.header}>How to play</h1>
      <p css={styles.text}>
        Button presses for the game are voted on and decided by all the players!
        To get started, just connect any supported wallet and click on any of
        the above buttons to send in a vote to the blockchain for the next
        button to press!
      </p>
      <p css={styles.text}>
        Votes are tallied every <span css={tw`font-bold`}>10 seconds</span>, and
        after the votes are tallied, the most voted upon button will be pressed
        and the game will be executed for{" "}
        <span css={tw`font-bold`}>1 second</span> (i.e. the game will progress
        for 1 second after each round of voting).
      </p>
      <p css={styles.text}>
        After game execution (execution should not take more than a couple of
        seconds), the next round of voting for the next game second will open up
        again.
      </p>
    </div>
  );
}