import * as Notifications from "expo-notifications";
import { api } from "@/services/api";
import { Platform } from "react-native";
import Constants from "expo-constants";

export async function registerPushToken() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const projectId =
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId;

  //const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
  const expoToken = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  
  const platform = Platform.OS;

  await api.post("/notifications/register-device", {
    pushToken: expoToken,
    platform,
  });
}
