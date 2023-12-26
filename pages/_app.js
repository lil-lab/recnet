import "@/styles/globals.css";
import { Provider } from "react-redux";
import store from "../utils/redux/store";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import { appPrimary, appSecondary } from "@/utils/constants";
import Head from "next/head";
import TopBar from "../components/TopBar";

export default function App({ Component, pageProps }) {
  const theme = createTheme({
    palette: {
      primary: { main: appPrimary },
      secondary: { main: appSecondary },
      white: { main: "#FFFFFF" },
    },
  });

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Head>
          <title>recnet</title>
          <meta name="description" content="Human-driven recommendation system for academic readings" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <TopBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}
