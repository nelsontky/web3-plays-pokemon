import tw from "twin.macro";
import Badges from "../types/badges";

const styles = {
  text: tw`
    text-xl
  `,
};

interface BadgesDisplayProps {
  badges: Badges;
}

export default function BadgesDisplay({ badges }: BadgesDisplayProps) {
  return (
    <div>
      <p css={styles.text}>Count: {badges.count}</p>
      <p css={styles.text}>{badges.badgesObtained.join(", ")}</p>
    </div>
  );
}
