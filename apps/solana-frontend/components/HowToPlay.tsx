import {
  MAX_BUTTONS_PER_ROUND,
  NUMBER_OF_SECONDS_TO_EXECUTE_PER_BUTTON_PRESS,
  VOTE_SECONDS,
} from "common";
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

export default function HowToPlay({ id }: { id?: string }) {
  return (
    <div css={styles.root} id={id}>
      <h1 css={styles.header}>How to play</h1>
      <p css={styles.text}>
        Button presses for the game are decided by all the players! To get
        started, just connect any supported wallet. Afterwards, click on any of
        the gamepad buttons to send in a button press to the blockchain!
      </p>
      <p css={styles.text}>
        One round lasts for {VOTE_SECONDS} seconds, and the first{" "}
        {MAX_BUTTONS_PER_ROUND} button presses in a round are executed. If there
        are less than {MAX_BUTTONS_PER_ROUND} button presses when a round ends,
        the first button press after the round ends will be the last button
        executed for that round.
      </p>
      <p css={styles.text}>
        After game execution (execution should not take more than a couple of
        seconds), the next round will then open up.
      </p>
    </div>
  );
}
