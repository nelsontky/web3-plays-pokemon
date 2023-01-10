import tw from "twin.macro";
import Item from "../types/item";

const styles = {
  root: tw`
    mb-6
  `,
  name: tw`
    text-2xl
  `,
  quantity: tw`
    text-xl
  `,
};

interface ItemDisplayProps {
  item: Item;
}

export default function ItemDisplay({ item }: ItemDisplayProps) {
  return (
    <div css={styles.root}>
      <h2 css={styles.name}>{item.name}</h2>
      <p css={styles.quantity}>Quantity: {item.quantity}</p>
    </div>
  );
}
