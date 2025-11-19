import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export async function setItem(key: string, value: string) {
  return isWeb
    ? AsyncStorage.setItem(key, value)
    : SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string) {
  return isWeb
    ? AsyncStorage.getItem(key)
    : SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string) {
  return isWeb
    ? AsyncStorage.removeItem(key)
    : SecureStore.deleteItemAsync(key);
}
