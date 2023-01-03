import tw from "twin.macro";

const styles = {
  root: tw`
    flex
    mb-3
    justify-center
    gap-4
  `,
  text: tw`
    text-lg
    underline
  `,
};

export default function SocialLinks() {
  return (
    <div css={styles.root}>
      <a
        css={styles.text}
        href="https://discord.gg/8nv3699FwH"
        target="_blank"
        rel="noreferrer"
      >
        Discord
      </a>
      <a
        css={styles.text}
        href="https://twitter.com/sol_idity"
        target="_blank"
        rel="noreferrer"
      >
        Twitter
      </a>
      <a
        css={styles.text}
        href="https://github.com/nelsontky/web3-plays-pokemon"
        target="_blank"
        rel="noreferrer"
      >
        GitHub
      </a>
    </div>
  );
}
