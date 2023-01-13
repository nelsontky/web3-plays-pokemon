import tw from "twin.macro";
import useGameboyMemory from "../hooks/useGameboyMemory";
import usePartyData from "../hooks/usePartyData";
import BadgesDisplay from "./BadgesDisplay";
import ItemDisplay from "./ItemDisplay";
import PokemonDisplay from "./PokemonDisplay";
import useBadgesData from "./useBadgesData";
import useItemsData from "./useItemsData";

const styles = {
  root: tw`
    flex
    gap-8
  `,
  header: tw`
    text-4xl
    mb-4
  `,
  section: tw`
    w-1/3
  `,
};

export default function GameState() {
  const gameboyMemory = useGameboyMemory();

  const pokemons = usePartyData(gameboyMemory);
  const items = useItemsData(gameboyMemory);
  const badges = useBadgesData(gameboyMemory);

  if (!items || !pokemons || !badges) {
    return <div css={styles.root} />;
  }

  return (
    <div css={styles.root}>
      <div css={styles.section}>
        <h1 css={styles.header}>Badges</h1>
        <BadgesDisplay badges={badges} />
      </div>
      <div css={styles.section}>
        <h1 css={styles.header}>Pokemon in party</h1>
        {pokemons.map((pokemon) => (
          <PokemonDisplay pokemon={pokemon} key={JSON.stringify(pokemon)} />
        ))}
      </div>
      <div css={styles.section}>
        <h1 css={styles.header}>Items in bag</h1>
        {items.map((item) => (
          <ItemDisplay item={item} key={item.name} />
        ))}
      </div>
    </div>
  );
}
