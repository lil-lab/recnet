import "@/styles/globals.css";
import { Provider } from "react-redux";
import store from "../utils/redux/store";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { lime, grey } from "@mui/material/colors";

import TopBar from "../components/TopBar";

export default function App({ Component, pageProps }) {
  const theme = createTheme({
    palette: {
      primary: { main: "#1A2930" },
      secondary: { main: "#F7CE3E" },
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
