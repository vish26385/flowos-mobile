import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import { ExpoRoot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

export function App() {
    const ctx = require.context("./", true, /_layout|index\.(tsx|ts|js|jsx)$/);
  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3LightTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ExpoRoot context={ctx} />
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent("main", () => App);
registerRootComponent(App);
