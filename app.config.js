// export default {
//   name: "FlowOS",
//   slug: "flowos-mobile",
//   scheme: "flowos",
//   version: "1.0.0",
//   orientation: "portrait",

//   icon: "./assets/icon.png",
//   userInterfaceStyle: "automatic",

//   splash: {
//     image: "./assets/splash.png",
//     resizeMode: "contain",
//     backgroundColor: "#ffffff",
//   },

//   assetBundlePatterns: ["**/*"],
//   platforms: ["android", "ios", "web"],

//   experiments: {
//     typedRoutes: true,
//   },

//   plugins: [
//     "expo-system-ui",
//     "expo-secure-store",
//     "expo-router",
//     "./plugins/disableKotlinWerror",
//     [
//       "expo-notifications",
//       {
//         icon: "./assets/icon.png",
//         color: "#7b61ff",
//       },
//     ],

//     [
//       "expo-build-properties",
//       {
//         android: {     
//           compileSdkVersion: 35,
//           targetSdkVersion: 35,
//           minSdkVersion: 24,
//           newArchEnabled: false,
//           hermesEnabled: false
//         },
//       }
//     ]
//   ],

//   android: {
//     package: "com.anonymous.flowosmobile",
//   },

//   web: {
//     bundler: "metro",
//     output: "single",
//   },

//   expo: {
//     android: {
//       googleServicesFile: "./google-services.json",
//     },
//   },

//   extra: {
//     eas: {
//       projectId: "ef4d4f42-fbb8-4084-b256-fb6fd8077519",
//     },
//     API_URL:      
//       "https://flowos-backend.onrender.com/api",
//   },
// };

export default {
  name: "FlowOS",
  slug: "flowos-mobile",
  scheme: "flowos",
  version: "1.0.0",
  orientation: "portrait",

  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",

  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  assetBundlePatterns: ["**/*"],
  platforms: ["android", "ios", "web"],

  experiments: {
    typedRoutes: true,
  },

  plugins: [
    "expo-system-ui",
    "expo-secure-store",
    "expo-router",
    "./plugins/disableKotlinWerror",
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#7b61ff",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 24,
          newArchEnabled: false,
          hermesEnabled: false,
        },
      },
    ],
  ],

  android: {
    package: "com.anonymous.flowosmobile",
    googleServicesFile: "./google-services.json", // ✅ REQUIRED for Firebase/FCM
  },

  web: {
    bundler: "metro",
    output: "single",
  },

  extra: {
    eas: {
      projectId: "ef4d4f42-fbb8-4084-b256-fb6fd8077519", // ✅ REQUIRED for EAS linking
    },
    API_URL: "https://flowos-backend.onrender.com/api",
  },
};