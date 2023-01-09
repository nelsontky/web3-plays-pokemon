import tw from "twin.macro";
import useGameboyMemory from "../hooks/useGameboyMemory";
import usePartyData from "../hooks/usePartyData";
import PokemonDisplay from "./PokemonDisplay";

const styles = {
  header: tw`
    text-3xl
    mb-4
  `,
};

export default function GameState() {
  const gameboyMemory = useGameboyMemory();
  const pokemons = usePartyData(gameboyMemory);

  if (gameboyMemory === undefined) {
    return <>Loading</>;
  }

  return (
    <div>
      <h1 css={styles.header}>Pokemon in party</h1>
      {!!pokemons &&
        pokemons.map((pokemon, i) => (
          <PokemonDisplay pokemon={pokemon} key={i} />
        ))}
    </div>
  );
}
