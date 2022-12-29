import { cache } from "@emotion/css";
import { CacheProvider } from "@emotion/react";
import type { AppProps } from "next/app";
import AppBar from "../components/AppBar";
import SolanaContext from "../contexts/SolanaContext";
import GlobalStyles from "./../styles/GlobalStyles";

const App = ({ Component, pageProps }: AppProps) => (
  <CacheProvider value={cache}>
    <GlobalStyles />
    <SolanaContext>
      <AppBar />
      <Component {...pageProps} />
    </SolanaContext>
  </CacheProvider>
);

export default App;
