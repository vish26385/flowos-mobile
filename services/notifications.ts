import * as Notifications from "expo-notifications";
import { api } from "@/services/api";
import { Platform } from "react-native";

export async function registerPushToken() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  //const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
  const expoToken = (await Notifications.getExpoPushTokenAsync({
      projectId: "ef4d4f42-fbb8-4084-b256-fb6fd8077519"
    })).data;
  const platform = Platform.OS;

  await api.post("/notifications/register-device", {
    pushToken: expoToken,
    platform,
  });
}
