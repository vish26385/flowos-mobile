import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
//import { Text } from "react-native";

export default function TabsLayout() {
  const { token } = useAuth();
  if (!token) return null; // should never render if you have a Redirect guard

  return (
    // <TaskProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Plan",
            //tabBarLabel: ({ color }) => <Text style={{ color }}>Plan</Text>,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-today"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks/index"
          options={{
            title: "Tasks",
            //tabBarLabel: ({ color }) => <Text style={{ color }}>Tasks</Text>,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="check-circle-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            //tabBarLabel: ({ color }) => <Text style={{ color }}>Profile</Text>,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-circle"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
  // </TaskProvider>
  );
}
