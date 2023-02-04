import { registerRootComponent } from "expo";
import { RecoilRoot } from "recoil";
import { ActivityIndicator, View } from "react-native";
import { useFonts, Inter_900Black } from "@expo-google-fonts/dev";

import { HomeScreen } from "./screens/HomeScreen";
import XnftContextProvider from "./contexts/XnftProvider";

function App() {
  let [fontsLoaded] = useFonts({
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RecoilRoot>
      <XnftContextProvider>
        <HomeScreen />
      </XnftContextProvider>
    </RecoilRoot>
  );
}

export default registerRootComponent(App);
