import { useEffect } from "react";
import { StatusBar, AppState } from "react-native";
import { useTheme } from "react-native-paper";

export function useStatusBarColor() {
  const theme = useTheme();

  useEffect(() => {
    const applyColor = () => {
      StatusBar.setBackgroundColor(theme.colors.primary);
      StatusBar.setBarStyle(theme.dark ? "light-content" : "dark-content");
    };

    // initial apply
    applyColor();

    // reapply when app returns from background
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") applyColor();
    });

    return () => sub.remove();
  }, [theme]);
}
