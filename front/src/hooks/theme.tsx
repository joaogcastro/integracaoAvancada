/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode, createContext, useContext, useState } from "react";

export interface ThemeContextData {
  theme: "light" | "dark";
  onChangeTheme(): void;
}

export const ThemeContext = createContext<ThemeContextData>(
  {} as ThemeContextData
);

interface themProp {
  children: ReactNode;
}

export const DarkModeProvider = ({ children }: themProp) => {
  const [theme, setTheme] = useState<ThemeContextData["theme"]>(() => {
    const savedTheme = localStorage.getItem("gcc_ticket/theme") as
      | ThemeContextData["theme"]
      | null;

    return savedTheme || "light";
  });

  const onChangeTheme = () => {
    setTheme((old) => {
      if (old === "dark") {
        localStorage.setItem("gcc_ticket/theme", "light");

        return "light";
      }
      localStorage.setItem("gcc_ticket/theme", "dark");

      return "dark";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        onChangeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useDarkMode(): ThemeContextData {
  const context = useContext(ThemeContext);
  return context;
}