import { GAME_DATA_ACCOUNT_ID } from "common";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import ConfigProvider from "ui/contexts/ConfigProvider";
import { store } from "ui/store";
import AppSnackBarProvider from "ui/contexts/AppSnackBarProvider";
import SolanaContext from "ui/contexts/SolanaContext";
import AppBar from "ui/components/AppBar";
import AnnouncementBar from "ui/components/AnnouncementBar";
import tw from "twin.macro";

const App = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <SolanaContext>
      <ConfigProvider gameDataAccountId={GAME_DATA_ACCOUNT_ID}>
        <AppSnackBarProvider>
          <AnnouncementBar>
            <span>
              Pokemon Red has been completed! Click{" "}
              <a
                css={tw`underline`}
                href="https://solana.playspokemon.xyz"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{" "}
              to play Pokemon Crystal.
            </span>
          </AnnouncementBar>
          <AppBar title="Solana Plays Pokemon Red" />
          <Component {...pageProps} />
        </AppSnackBarProvider>
      </ConfigProvider>
    </SolanaContext>
  </Provider>
);

export default App;
