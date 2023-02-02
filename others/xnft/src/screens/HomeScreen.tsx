import tw from "twrnc";

export function HomeScreen() {
  return (
    <iframe
      src="http://localhost:3001?isXnft=true"
      style={tw`border-0 w-full h-full`}
    />
  );
}
