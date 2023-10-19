import "@/styles/globals.css";
import { Provider } from "react-redux";
import store from "../utils/redux/store";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import TopBar from "../components/TopBar";
import { appPrimary, appSecondary } from "@/utils/constants";

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
        <TopBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}
