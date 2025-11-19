import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { Platform } from "react-native";

const primaryColor = "#7C4DFF";        // FlowOS Signature Purple
const secondaryColor = "#B388FF";      // Accent tint
const backgroundLight = "#FAF8FF";     // Soft neutral background
const backgroundDark = "#121212";      // Modern dark tone
const textPrimaryLight = "#2E1A47";    // Deep violet for readability
const textSecondaryLight = "#6E6B7B";
const textPrimaryDark = "#EDE7F6";
const textSecondaryDark = "#BDBDBD";

export const FlowOSLightTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: backgroundLight,
    surface: "#FFFFFF",
    text: textPrimaryLight,
    outline: "#E0E0E0",
    onSurface: textSecondaryLight,
    onBackground: textPrimaryLight,
    error: "#E53935",
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: { fontFamily: Platform.OS === "ios" ? "System" : "Roboto", fontWeight: "400" },
    medium: { fontFamily: Platform.OS === "ios" ? "System" : "Roboto-Medium", fontWeight: "500" },
    bold: { fontFamily: Platform.OS === "ios" ? "System" : "Roboto-Bold", fontWeight: "700" },
  },
};

export const FlowOSDarkTheme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: backgroundDark,
    surface: "#1E1E1E",
    text: textPrimaryDark,
    onSurface: textSecondaryDark,
    onBackground: textPrimaryDark,
    error: "#EF5350",
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    regular: { fontFamily: Platform.OS === "ios" ? "System" : "Roboto", fontWeight: "400" },
    medium: { fontFamily: Platform.OS === "ios" ? "System" : "Roboto-Medium", fontWeight: "500" },
    bold: { fontFamily: Platform.OS === "ios" ? "System" : "Roboto-Bold", fontWeight: "700" },
  },
};
