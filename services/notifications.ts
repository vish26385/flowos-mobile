import * as Notifications from "expo-notifications";
import { api } from "@/services/api";
import { Platform } from "react-native";
import Constants from "expo-constants";

// export async function registerPushToken() {
//   try {
//     console.log("[PUSH] start registerPushToken");

//     const perms = await Notifications.getPermissionsAsync();
//     console.log("[PUSH] existing permission:", perms.status);

//     const request = await Notifications.requestPermissionsAsync();
//     console.log("[PUSH] permission after request:", request.status);

//     if (request.status !== "granted") {
//       console.log("[PUSH] permission NOT granted, exiting");
//       return;
//     }

//     const expoToken = (await Notifications.getExpoPushTokenAsync({
//       projectId: "ef4d4f42-fbb8-4084-b256-fb6fd8077519",
//     })).data;

//     console.log("[PUSH] expoToken:", expoToken);

//     const res = await api.post("/notifications/register-device", {
//       pushToken: expoToken,
//       platform: Platform.OS,
//     });

//     console.log("[PUSH] backend register-device OK:", res.status, res.data);
//   } catch (err: any) {
//     console.log("[PUSH] build:", Constants.expoConfig?.version, Constants.expoConfig?.android?.versionCode);
//     console.log("[PUSH] registerPushToken FAILED:", {
//       msg: err?.message,
//       status: err?.response?.status,
//       data: err?.response?.data,
//       url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
//     });
//   }
// }

export async function registerPushToken() {
  try {
    // ✅ Web does not support expo push tokens
    if (Platform.OS === "web") {
      console.log("[PUSH] web - skip");
      return;
    }

    // ✅ Optional: avoid running on emulator (Android) where token may fail
    // (If you want, we can add expo-device check too)

    console.log("[PUSH] start registerPushToken");

    // ✅ Get existing permission first
    const perms = await Notifications.getPermissionsAsync();
    let status = perms.status;
    console.log("[PUSH] existing permission:", status);

    // ✅ Request only if not granted
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
      console.log("[PUSH] permission after request:", status);
    }

    if (status !== "granted") {
      console.log("[PUSH] permission NOT granted, exiting");
      return;
    }

    // ✅ Use projectId from config (best practice) but fallback to your hardcoded id
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      "ef4d4f42-fbb8-4084-b256-fb6fd8077519";

    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoToken = tokenResp.data;

    console.log("[PUSH] expoToken:", expoToken);

    const res = await api.post("/notifications/register-device", {
      pushToken: expoToken,
      platform: Platform.OS,
    });

    console.log("[PUSH] backend register-device OK:", res.status, res.data);
  } catch (err: any) {
    console.log(
      "[PUSH] build:",
      Constants.expoConfig?.version,
      Constants.expoConfig?.android?.versionCode
    );

    console.log("[PUSH] registerPushToken FAILED:", {
      msg: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
    });
  }
}