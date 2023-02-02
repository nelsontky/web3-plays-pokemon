import { V2_GAME_DATA_ACCOUNT_ID } from "common";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import ConfigProvider from "ui/contexts/ConfigProvider";
import { store } from "ui/store";
import AppSnackBarProvider from "ui/contexts/AppSnackBarProvider";
import SolanaContext from "ui/contexts/SolanaContext";
import AnnouncementBar from "ui/components/AnnouncementBar";
import tw from "twin.macro";
import AppBar from "ui/components/AppBar";

const App = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <SolanaContext>
      <ConfigProvider
        gameDataAccountId={V2_GAME_DATA_ACCOUNT_ID}
        messagesCollection="crystal"
        hideStats
        isXnft
      >
        <AppSnackBarProvider>
          <AnnouncementBar>
            <span>
              Looking for the OG Pokemon Red? Click{" "}
              <a
                css={tw`underline`}
                href="https://red.playspokemon.xyz"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{" "}
              to play Pokemon Red!
            </span>
          </AnnouncementBar>
          <AppBar title="Solana Plays Pokemon Crystal" />
          <Component {...pageProps} />
        </AppSnackBarProvider>
      </ConfigProvider>
    </SolanaContext>
  </Provider>
);

export default App;
