import { registerRootComponent } from "expo";
import { RecoilRoot } from "recoil";

import { HomeScreen } from "./screens/HomeScreen";
import XnftContextProvider from "./contexts/XnftProvider";

function App() {
  return (
    <RecoilRoot>
      <XnftContextProvider>
        <HomeScreen />
      </XnftContextProvider>
    </RecoilRoot>
  );
}

export default registerRootComponent(App);
