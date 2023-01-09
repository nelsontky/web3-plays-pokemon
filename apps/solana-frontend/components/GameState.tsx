import { LinearProgress } from "@mui/material";
import tw from "twin.macro";
import useGameboyMemory from "../hooks/useGameboyMemory";
import usePartyData from "../hooks/usePartyData";
import PokemonDisplay from "./PokemonDisplay";

const styles = {
  header: tw`
    text-4xl
    mb-4
  `,
};

export default function GameState() {
  const gameboyMemory = useGameboyMemory();
  const pokemons = usePartyData(gameboyMemory);

  return (
    <div>
      <h1 css={styles.header}>Pokemon in party</h1>
      {pokemons === undefined ? (
        <LinearProgress color="inherit" />
      ) : (
        pokemons.map((pokemon) => (
          <PokemonDisplay pokemon={pokemon} key={JSON.stringify(pokemon)} />
        ))
      )}
    </div>
  );
}
