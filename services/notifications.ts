import * as Notifications from "expo-notifications";
import { api } from "@/services/api";
import { Platform } from "react-native";
import Constants from "expo-constants";

// export async function registerPushToken() {
//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== "granted") return;

//   const projectId =
//   Constants.expoConfig?.extra?.eas?.projectId ??
//   Constants.easConfig?.projectId;

//   //const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
//   const expoToken = (
//     await Notifications.getExpoPushTokenAsync({ projectId })
//   ).data;
  
//   const platform = Platform.OS;

//   await api.post("/notifications/register-device", {
//     pushToken: expoToken,
//     platform,
//   });
// }

export async function registerPushToken() {
  try {
    console.log("[PUSH] start registerPushToken");

    const perms = await Notifications.getPermissionsAsync();
    console.log("[PUSH] existing permission:", perms.status);

    const request = await Notifications.requestPermissionsAsync();
    console.log("[PUSH] permission after request:", request.status);

    if (request.status !== "granted") {
      console.log("[PUSH] permission NOT granted, exiting");
      return;
    }

    const expoToken = (await Notifications.getExpoPushTokenAsync({
      projectId: "ef4d4f42-fbb8-4084-b256-fb6fd8077519",
    })).data;

    console.log("[PUSH] expoToken:", expoToken);

    const res = await api.post("/notifications/register-device", {
      pushToken: expoToken,
      platform: Platform.OS,
    });

    console.log("[PUSH] backend register-device OK:", res.status, res.data);
  } catch (err: any) {
    console.log("[PUSH] registerPushToken FAILED:", {
      msg: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
    });
  }
}
