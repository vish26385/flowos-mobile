// 🌐 Offline Sync placeholder (Phase 2)
// Later will integrate with AsyncStorage + NetInfo to queue and sync tasks offline.

import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

let subscribed = false;
let lastState: boolean | null = null;

export function useOfflineSync() {
  useEffect(() => {

     if (subscribed) return;
    subscribed = true;

     const unsubscribe = NetInfo.addEventListener((state) => {
      // ✅ Fire only when connectivity actually changes
      if (state.isConnected !== lastState) {
        lastState = state.isConnected ?? null;

        if (state.isConnected) {
          console.log("📡 Network online — ready to sync cached tasks");
          // push pending tasks here
        } else {
          console.log("🔌 Offline mode — caching new tasks locally");
          // cache new tasks here
        }
      }
    });

     return () => {
      unsubscribe();
      subscribed = false;
      lastState = null;
    };
    
  }, []);
}