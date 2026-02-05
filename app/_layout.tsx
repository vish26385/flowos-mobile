import { useStatusBarColor } from "@/hooks/useStatusBarColor";
import React, { useEffect, useState } from "react";
import { View, StatusBar, Platform, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useThemeMode } from "@/context/ThemeContext";
import { useSegments, useRouter } from "expo-router";
import { TaskProvider } from "@/context/TaskContext";
import { loadAsync } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootSiblingParent } from "react-native-root-siblings";
import { useKeepAwake } from "expo-keep-awake";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";  
//import { registerPushToken } from "@/services/notifications";
import * as Notifications from "expo-notifications";

// 👇 MUST be defined before component mount
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // 🆕 REQUIRED IN SDK 49+
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient();

export function AuthGate() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {

    //  (async () => {
    //   await registerPushToken();   // 🔥 runs once on startup
    //  })();

    if (loading) return;
    const segs = segments as string[]; // ✅ cast once safely
    const inAuthGroup = segs.includes("login") || segs.includes("register") || segs.includes("forgot") || segs.includes("reset");
    
    if (!token && !inAuthGroup) {
      router.replace("/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

function AppWrapper() {
  const { theme } = useThemeMode();
  //useStatusBarColor();   // ✅ keeps color alive across resume

  // // ✅ Preload MaterialCommunityIcons once for all Paper inputs
  // useEffect(() => {
  //   loadAsync(MaterialCommunityIcons.font);
  // }, []);

  return (
    <SafeAreaProvider>     
      <PaperProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TaskProvider>
            {/* ✅ Only a plain View here — SafeArea handled inside individual screens */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.background,
                }}
              >
              <Stack screenOptions={{ headerShown: false }} />
              <AuthGate />
            </View>
            </TaskProvider>
          </AuthProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
   // ✅ keeps screen on during development
  useKeepAwake();
  useStatusBarColor();   // ✅ keeps color alive across resume
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // ✅ Preload MaterialCommunityIcons once for all Paper inputs
  useEffect(() => {

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    loadAsync(MaterialCommunityIcons.font);
    async function loadFonts() {
      await Font.loadAsync(Ionicons.font); // 👈 preload Ionicons
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) return null; // or splash screen
   
  return (
    <RootSiblingParent>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </RootSiblingParent>
  );
}

