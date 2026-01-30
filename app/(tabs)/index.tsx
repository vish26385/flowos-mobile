import React, { useMemo } from "react";
import {
  View,
  FlatList,
  StatusBar,
  Platform,
  StyleSheet,
} from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  useTheme,
  MD3LightTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext"; // ✅ auth gate
// import * as Notifications from "expo-notifications";

// async function testNotification() {

//    if (Platform.OS === "web") {
//     alert("❌ Notifications are NOT supported on Web browser.");
//     return;
//   }
  
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "🚀 PUSH WORKING!",
//       body: "YES! THIS ONE WORKS!",
//     },
//     trigger: {
//       type: "timeInterval",
//       seconds: 3,
//       repeats: false,
//     } as any,
//   });
// }

type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: number;
  completed: boolean;
};

export default function DailyPlan() {
  const theme = useTheme();
  const { token, loading } = useAuth(); // ✅ read auth state
  const { logout } = useAuth();
  const today = useMemo(() => dayjs().startOf("day"), []);
  const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

  // ✅ block first-frame mount while loading or unauthenticated
  if (loading || !token) {
    return null; // or return a splash/placeholder if you prefer
  }

  const { data } = useQuery({
    queryKey: ["tasks", "today", todayStr], // ✅ include the date for cache correctness
    // queryFn: async () =>
    //   (await api.get("/tasks?due=" + todayStr)).data as Task[],
    queryFn: async () => {
      try {
        const res = await api.get(`/tasks?due=${todayStr}`);
        console.log("✅ DailyPlan SUCCESS:", res.status);
        return res.data as Task[];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          await logout();
          return []; // or throw err; but usually return empty after logout
        }
        console.log("❌ DailyPlan error:", {
          msg: err?.message,
          status: err?.response?.status,
          url: (err?.config?.baseURL || "") + (err?.config?.url || ""),          
        });
        throw err;
      }
    },
    enabled: !!token, // ✅ only fetch when authenticated
  });

  const backgroundColor =
    theme?.colors?.background || MD3LightTheme.colors.background;

  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.safe, { backgroundColor }])}
    >
      <View style={StyleSheet.flatten([styles.container])}>
        {/* Header */}
        <View style={StyleSheet.flatten([styles.headerRow])}>
          <IconButton
            icon="calendar-month"
            iconColor={theme.colors.primary}
            size={28}
          />
          <Text
            variant="headlineMedium"
            style={StyleSheet.flatten([
              styles.headerTitle,
              { color: theme.colors.onBackground },
            ])}
          >
            Today’s Plan
          </Text>
        </View>

        <Text
          style={StyleSheet.flatten([
            styles.dateText,
            { color: theme.colors.onSurfaceVariant || theme.colors.onSurface },
          ])}
        >
          {today.format("dddd, D MMM YYYY")}
        </Text>

        <Divider
          bold
          style={StyleSheet.flatten([
            {
              marginBottom: 12,
              opacity: 0.15,
              backgroundColor: theme.colors.outline,
            },
          ])}
        />

        {/* Task List */}
        <FlatList
          data={data || []}
          keyExtractor={(t) => String(t.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card
              mode="elevated"
              style={StyleSheet.flatten([
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  shadowColor: theme.colors.primary + "33",
                },
              ])}
            >
              <Card.Content style={StyleSheet.flatten([{ paddingVertical: 8 }])}>
                <Text
                  style={StyleSheet.flatten([
                    styles.taskTitle,
                    { color: theme.colors.onSurface },
                  ])}
                >
                  {item.title}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.taskTime,
                    { color: theme.colors.primary },
                  ])}
                >
                  {dayjs(item.dueDate).format("h:mm A")}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.taskDesc,
                    { color: theme.colors.onSurfaceVariant || "#999" },
                  ])}
                >
                  {item.description}
                </Text>
              </Card.Content>

              <Card.Actions style={StyleSheet.flatten([{ justifyContent: "flex-end" }])}>
                <Link href={`/tasks/${item.id}`} asChild>
                  <Button
                    mode="outlined"
                    textColor={theme.colors.primary}
                    style={StyleSheet.flatten([
                      styles.openBtn,
                      { borderColor: theme.colors.primary },
                    ])}
                    labelStyle={StyleSheet.flatten([{ fontWeight: "600" }])}
                  >
                    Open
                  </Button>
                </Link>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <View style={StyleSheet.flatten([{ alignItems: "center", marginTop: 120 }])}>
              <Text
                style={StyleSheet.flatten([
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ])}
              >
                No tasks for today
              </Text>
              <Link href="/tasks" asChild>
                <Button
                  mode="contained"
                  style={StyleSheet.flatten([
                    styles.addBtn,
                    { backgroundColor: theme.colors.primary },
                  ])}
                  labelStyle={StyleSheet.flatten([
                    { fontWeight: "600", color: theme.colors.onPrimary },
                  ])}
                >
                  Add Task
                </Button>               
              </Link>
              {/* <Button onPress={testNotification}> TEST NOTIFICATION </Button> */}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  headerTitle: {
    fontWeight: "700",
  },
  dateText: {
    fontSize: 15,
    marginLeft: 8,
    marginBottom: 8,
  },
  card: {
    marginBottom: 14,
    borderRadius: 18,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  taskTime: {
    fontSize: 14,
    marginTop: 2,
  },
  taskDesc: {
    marginTop: 4,
    fontSize: 14,
  },
  openBtn: {
    borderRadius: 30,
  },
  addBtn: {
    borderRadius: 25,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
});