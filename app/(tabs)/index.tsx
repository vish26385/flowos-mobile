// import React, { useMemo } from "react";
// import { View, FlatList, Platform, StyleSheet } from "react-native";
// import {
//   Text,
//   Card,
//   Button,
//   IconButton,
//   Divider,
//   useTheme,
//   MD3LightTheme,
//   ActivityIndicator, 
// } from "react-native-paper";
// import { SafeAreaView } from "react-native-safe-area-context";
// import dayjs from "dayjs";
// import { Link } from "expo-router";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/services/api";
// import { useAuth } from "@/context/AuthContext";
// import { generateTodayPlan } from "@/services/planner";

// type Task = {
//   id: number;
//   title: string;
//   description: string;
//   dueDate: string;
//   priority: number;
//   completed: boolean;
// };

// export default function DailyPlan() {
//   const theme = useTheme();

//   // ✅ call useAuth ONCE
//   const { token, loading, logout } = useAuth();

//   const today = useMemo(() => dayjs().startOf("day"), []);
//   const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

//   const isAuthed = !!token && !loading;

//   // ✅ ALWAYS call the hook; control behavior with `enabled`
//   const tasksQuery = useQuery({
//     queryKey: ["tasks", "today", todayStr],
//     enabled: isAuthed,
//     queryFn: async () => {
//       try {
//         const res = await api.get(`/tasks?due=${todayStr}`);
//         console.log("✅ DailyPlan SUCCESS:", res.status);
//         return res.data as Task[];
//       } catch (err: any) {
//         if (err?.response?.status === 401) {
//           // ✅ logout and return safe value so UI doesn't crash
//           await logout();
//           return [];
//         }
//         console.log("❌ DailyPlan error:", {
//           msg: err?.message,
//           status: err?.response?.status,
//           url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
//         });
//         throw err;
//       }
//     },
//   });

//   const backgroundColor =
//     theme?.colors?.background || MD3LightTheme.colors.background;

//   // ✅ AFTER hooks: you can early return safely
//   if (loading) {
//     return (
//       <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
//         <View style={StyleSheet.flatten([styles.container, { justifyContent: "center", alignItems: "center" }])}>
//           <Text style={{ color: theme.colors.onBackground }}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!token) {
//     // If user is not logged in, don't render this screen
//     // (you can replace this with redirect logic if needed)
//     return null;
//   }

//   const data = tasksQuery.data || [];

//   return (
//     <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
//       <View style={StyleSheet.flatten([styles.container])}>
//         {/* Header */}
//         <View style={StyleSheet.flatten([styles.headerRow])}>
//           <IconButton icon="calendar-month" iconColor={theme.colors.primary} size={28} />
//           <Text
//             variant="headlineMedium"
//             style={StyleSheet.flatten([
//               styles.headerTitle,
//               { color: theme.colors.onBackground },
//             ])}
//           >
//             Today’s Plan
//           </Text>
//         </View>

//         <Text
//           style={StyleSheet.flatten([
//             styles.dateText,
//             { color: theme.colors.onSurfaceVariant || theme.colors.onSurface },
//           ])}
//         >
//           {today.format("dddd, D MMM YYYY")}
//         </Text>

//         <Divider
//           bold
//           style={StyleSheet.flatten([
//             {
//               marginBottom: 12,
//               opacity: 0.15,
//               backgroundColor: theme.colors.outline,
//             },
//           ])}
//         />

//         {/* Task List */}
//         <FlatList
//           data={data}
//           keyExtractor={(t) => String(t.id)}
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item }) => (
//             <Card
//               mode="elevated"
//               style={StyleSheet.flatten([
//                 styles.card,
//                 {
//                   backgroundColor: theme.colors.surface,
//                   shadowColor: theme.colors.primary + "33",
//                 },
//               ])}
//             >
//               <Card.Content style={StyleSheet.flatten([{ paddingVertical: 8 }])}>
//                 <Text
//                   style={StyleSheet.flatten([
//                     styles.taskTitle,
//                     { color: theme.colors.onSurface },
//                   ])}
//                 >
//                   {item.title}
//                 </Text>

//                 <Text
//                   style={StyleSheet.flatten([
//                     styles.taskTime,
//                     { color: theme.colors.primary },
//                   ])}
//                 >
//                   {dayjs(item.dueDate).format("h:mm A")}
//                 </Text>

//                 <Text
//                   style={StyleSheet.flatten([
//                     styles.taskDesc,
//                     { color: theme.colors.onSurfaceVariant || "#999" },
//                   ])}
//                 >
//                   {item.description}
//                 </Text>
//               </Card.Content>

//               <Card.Actions style={StyleSheet.flatten([{ justifyContent: "flex-end" }])}>
//                 <Link href={`/tasks/${item.id}`} asChild>
//                   <Button
//                     mode="outlined"
//                     textColor={theme.colors.primary}
//                     style={StyleSheet.flatten([
//                       styles.openBtn,
//                       { borderColor: theme.colors.primary },
//                     ])}
//                     labelStyle={StyleSheet.flatten([{ fontWeight: "600" }])}
//                   >
//                     Open
//                   </Button>
//                 </Link>
//               </Card.Actions>
//             </Card>
//           )}
//           ListEmptyComponent={
//             <View style={StyleSheet.flatten([{ alignItems: "center", marginTop: 120 }])}>
//               <Text
//                 style={StyleSheet.flatten([
//                   styles.emptyText,
//                   { color: theme.colors.onSurfaceVariant },
//                 ])}
//               >
//                 {tasksQuery.isLoading ? "Loading tasks..." : "No tasks for today"}
//               </Text>

//               <Link href="/tasks" asChild>
//                 <Button
//                   mode="contained"
//                   style={StyleSheet.flatten([
//                     styles.addBtn,
//                     { backgroundColor: theme.colors.primary },
//                   ])}
//                   labelStyle={StyleSheet.flatten([
//                     { fontWeight: "600", color: theme.colors.onPrimary },
//                   ])}
//                 >
//                   Add Task
//                 </Button>
//               </Link>
//             </View>
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === "android" ? 0 : 0,
//   },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },
//   headerTitle: {
//     fontWeight: "700",
//   },
//   dateText: {
//     fontSize: 15,
//     marginLeft: 8,
//     marginBottom: 8,
//   },
//   card: {
//     marginBottom: 14,
//     borderRadius: 18,
//     elevation: 3,
//   },
//   taskTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//   },
//   taskTime: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   taskDesc: {
//     marginTop: 4,
//     fontSize: 14,
//   },
//   openBtn: {
//     borderRadius: 30,
//   },
//   addBtn: {
//     borderRadius: 25,
//     marginTop: 10,
//   },
//   emptyText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
// });

import React, { useMemo, useState } from "react";
import { View, FlatList, Platform, StyleSheet, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  useTheme,
  MD3LightTheme,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { generateTodayPlan } from "@/services/planner";

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

  // ✅ call useAuth ONCE
  const { token, loading, logout } = useAuth();

  const today = useMemo(() => dayjs().startOf("day"), []);
  const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

  const isAuthed = !!token && !loading;

  // ✅ STEP 11.1 state
  const [generating, setGenerating] = useState(false);

  // ✅ ALWAYS call the hook; control behavior with `enabled`
  const tasksQuery = useQuery({
    queryKey: ["tasks", "today", todayStr],
    enabled: isAuthed,
    queryFn: async () => {
      try {
        const res = await api.get(`/tasks?due=${todayStr}`);
        console.log("✅ DailyPlan SUCCESS:", res.status);
        return res.data as Task[];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          // ✅ logout and return safe value so UI doesn't crash
          await logout();
          return [];
        }
        console.log("❌ DailyPlan error:", {
          msg: err?.message,
          status: err?.response?.status,
          url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
        });
        throw err;
      }
    },
  });

  // ✅ STEP 11.1 handler
  const onGeneratePlan = async () => {
    if (generating) return;
    try {
      setGenerating(true);

      // ✅ call backend planner (make sure your endpoint in services/planner.ts is correct)
      const res = await generateTodayPlan();

      // ✅ refresh current screen data
      await tasksQuery.refetch();

      Alert.alert("Plan generated ✅", res?.message ?? "Today's plan is ready.");
    } catch (err: any) {
      console.log("[PLAN] generate failed:", {
        msg: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
      });

      Alert.alert(
        "Generate failed",
        err?.response?.data?.message ?? "Could not generate plan."
      );
    } finally {
      setGenerating(false);
    }
  };

  const backgroundColor =
    theme?.colors?.background || MD3LightTheme.colors.background;

  // ✅ AFTER hooks: you can early return safely
  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([styles.safe, { backgroundColor }])}
      >
        <View
          style={StyleSheet.flatten([
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ])}
        >
          <Text style={{ color: theme.colors.onBackground }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return null;
  }

  const data = tasksQuery.data || [];

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
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

        {/* ✅ STEP 11.1: Generate Plan Button (always visible) */}
        <View style={{ marginBottom: 12 }}>
          <Button
            mode="contained"
            icon="robot"
            onPress={onGeneratePlan}
            disabled={generating}
            style={{ borderRadius: 14 }}
          >
            {generating ? "Generating..." : "Generate Today Plan"}
          </Button>

          {generating && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator />
            </View>
          )}
        </View>

        {/* Task List */}
        <FlatList
          data={data}
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

              <Card.Actions
                style={StyleSheet.flatten([{ justifyContent: "flex-end" }])}
              >
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
            <View
              style={StyleSheet.flatten([
                { alignItems: "center", marginTop: 120 },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ])}
              >
                {tasksQuery.isLoading ? "Loading tasks..." : "No tasks for today"}
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
