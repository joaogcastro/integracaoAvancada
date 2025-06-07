import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/Routes";
import GlobalStyle from "./styles/global";
import { themesOptions } from "./styles/theme";
import { useDarkMode } from "./hooks/theme";
import { Toaster } from "sonner";


function App() {
  const { theme } = useDarkMode();
  console.log("Theme:", theme, "Theme Object:", themesOptions[theme]);

  return (
    <ThemeProvider theme={themesOptions[theme] as any}>
      <BrowserRouter>
        <GlobalStyle />
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
