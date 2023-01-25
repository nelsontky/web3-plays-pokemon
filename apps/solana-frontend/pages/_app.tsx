import { GAME_DATA_ACCOUNT_ID } from "common";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import ConfigProvider from "ui/contexts/ConfigProvider";
import { store } from "ui/store";
import AppSnackBarProvider from "ui/contexts/AppSnackBarProvider";
import SolanaContext from "ui/contexts/SolanaContext";

const App = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <SolanaContext>
      <ConfigProvider gameDataAccountId={GAME_DATA_ACCOUNT_ID}>
        <AppSnackBarProvider>
          <Component {...pageProps} />
        </AppSnackBarProvider>
      </ConfigProvider>
    </SolanaContext>
  </Provider>
);

export default App;
