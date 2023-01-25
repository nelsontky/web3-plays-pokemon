import tw from "twin.macro";
import Pokemon from "../types/pokemon";

const styles = {
  root: tw`
    mb-6
  `,
  name: tw`
    text-2xl
  `,
  stat: tw`
    text-xl
  `,
};

interface PokemonDisplayProps {
  pokemon: Pokemon;
}

export default function PokemonDisplay({ pokemon }: PokemonDisplayProps) {
  return (
    <div css={styles.root}>
      <h2 css={styles.name}>{pokemon.name}</h2>
      <ul css={styles.stat}>
        {pokemon.nickname !== null && <li>Nickname: {pokemon.nickname}</li>}
        <li>Level: {pokemon.level}</li>
        <li>
          HP: {pokemon.hp} / {pokemon.maxHp}
        </li>
      </ul>
    </div>
  );
}
