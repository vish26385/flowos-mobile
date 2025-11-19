// import React from "react";
// import { View } from "react-native";
// import { Text, Button, Avatar, Card, Switch, useTheme } from "react-native-paper";
// import { useAuth } from "@/context/AuthContext";
// import { useThemeMode } from "@/context/ThemeContext";

// export default function Profile() {
//   const { user, logout } = useAuth();
//   const { isDark, toggleTheme } = useThemeMode();
//   const theme = useTheme(); // ✅ get colors from current theme

//   const initials = (user?.name || "U").slice(0, 2).toUpperCase();

//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 16,
//         backgroundColor: theme.colors.background, // ✅ dynamic background
//       }}
//     >
//       <Card
//         style={{
//           borderRadius: 20,
//           width: "95%",
//           backgroundColor: theme.colors.surface, // ✅ matches theme
//           elevation: 3,
//         }}
//       >
//         <Card.Content style={{ alignItems: "center", paddingVertical: 32 }}>
//           <Avatar.Text
//             size={90}
//             label={initials}
//             style={{
//               backgroundColor: theme.colors.primary, // ✅ theme primary color
//               elevation: 4,
//               borderWidth: 2,
//               borderColor: theme.colors.background,
//             }}
//           />
//           <Text
//             style={{
//               fontSize: 22,
//               fontWeight: "700",
//               marginTop: 12,
//               color: theme.colors.onSurface, // ✅ text adapts automatically
//             }}
//           >
//             {user?.name || "User"}
//           </Text>
//           <Text
//             style={{
//               opacity: 0.7,
//               color: theme.colors.onSurfaceVariant || theme.colors.onSurface,
//             }}
//           >
//             {user?.email}
//           </Text>

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               marginTop: 20,
//             }}
//           >
//             <Text
//               style={{
//                 color: theme.colors.onSurface,
//                 marginRight: 8,
//               }}
//             >
//               Dark Mode
//             </Text>
//             <Switch value={isDark} onValueChange={toggleTheme} color={theme.colors.primary} />
//           </View>

//           <Button
//             mode="contained"
//             style={{
//               marginTop: 24,
//               borderRadius: 30,
//               width: 160,
//               elevation: 3,
//               backgroundColor: theme.colors.primary,
//             }}
//             labelStyle={{ fontSize: 16, color: theme.colors.onPrimary }}
//             onPress={logout}
//           >
//             Logout
//           </Button>
//         </Card.Content>
//       </Card>
//     </View>
//   );
// }

import React from "react";
import { View } from "react-native";
import { Text, Button, Avatar, Card, Switch, useTheme } from "react-native-paper";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";
import { Link } from "expo-router";   // ⭐ REQUIRED

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const theme = useTheme();

  const initials = (user?.name || "U").slice(0, 2).toUpperCase();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <Card
        style={{
          borderRadius: 20,
          width: "95%",
          backgroundColor: theme.colors.surface,
          elevation: 3,
        }}
      >
        <Card.Content style={{ alignItems: "center", paddingVertical: 32 }}>
          <Avatar.Text
            size={90}
            label={initials}
            style={{
              backgroundColor: theme.colors.primary,
              elevation: 4,
              borderWidth: 2,
              borderColor: theme.colors.background,
            }}
          />

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              marginTop: 12,
              color: theme.colors.onSurface,
            }}
          >
            {user?.name || "User"}
          </Text>

          <Text
            style={{
              opacity: 0.7,
              color: theme.colors.onSurfaceVariant || theme.colors.onSurface,
            }}
          >
            {user?.email}
          </Text>

          {/* 🌙 DARK MODE SWITCH */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: theme.colors.onSurface, marginRight: 8 }}>
              Dark Mode
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          </View>

          {/* 🔥🔥🔥 ADMIN-ONLY BUTTON */}
          {user?.roles?.includes("Admin") && (
            <Link href="/admin/audit" asChild>
              <Button
                mode="contained-tonal"
                icon="chart-bar"
                style={{
                  marginTop: 28,
                  borderRadius: 30,
                  width: 200,
                  elevation: 2,
                }}
              >
                AI Audit Dashboard
              </Button>
            </Link>
          )}

          {/* 🚪 LOGOUT BUTTON */}
          <Button
            mode="contained"
            style={{
              marginTop: 20,
              borderRadius: 30,
              width: 160,
              elevation: 3,
              backgroundColor: theme.colors.primary,
            }}
            labelStyle={{ fontSize: 16, color: theme.colors.onPrimary }}
            onPress={logout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}



