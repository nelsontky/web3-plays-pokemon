import { cache } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import AnchorSetup from "../components/AnchorSetup";
import AppBar from "../components/AppBar";
import ProgramListenersSetup from "../components/ProgramListenersSetup";
import AppSnackBarProvider from "../contexts/AppSnackBarProvider";
import SolanaContext from "../contexts/SolanaContext";
import { store } from "../store";
import GlobalStyles from "./../styles/GlobalStyles";

const App = ({ Component, pageProps }: AppProps) => (
  <CacheProvider value={cache}>
    <GlobalStyles />
    <SolanaContext>
      <AnchorSetup />
      <Provider store={store}>
        <AppSnackBarProvider>
          <ProgramListenersSetup />
          <AppBar />
          <Component {...pageProps} />
        </AppSnackBarProvider>
      </Provider>
    </SolanaContext>
  </CacheProvider>
);

export default App;
