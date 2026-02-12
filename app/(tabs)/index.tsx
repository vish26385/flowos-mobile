// import React, { useMemo, useState } from "react";
// import { View, FlatList, Platform, StyleSheet, Alert } from "react-native";
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
// import { Link, router } from "expo-router";
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

// /**
//  * ✅ Matches your backend DTOs:
//  * PlanResponseDto + PlanItemDto
//  */
// export type PlanItemDto = {
//   itemId: number;
//   taskId: number | null;
//   label: string;
//   start: string; // ISO string
//   end: string; // ISO string
//   confidence: number;
//   nudgeAt: string | null; // ISO string or null
// };

// export type PlanResponseDto = {
//   planId: number;
//   date: string; // "yyyy-MM-dd"
//   focus: string;
//   timeline: PlanItemDto[];
//   carryOver: number[];
//   rawJson?: string | null; // (you set null in controller, but keep optional)
//   prettyJson?: string | null;
// };

// export default function DailyPlan() {
//   const theme = useTheme();
//   const { token, loading, logout } = useAuth();

//   const today = useMemo(() => dayjs().startOf("day"), []);
//   const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

//   const isAuthed = !!token && !loading;
//   const [generating, setGenerating] = useState(false);

//   // -----------------------------
//   // TASKS QUERY (due today)
//   // -----------------------------
//   const tasksQuery = useQuery({
//     queryKey: ["tasks", "today", todayStr],
//     enabled: isAuthed,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     queryFn: async () => {
//       try {
//         const res = await api.get(`/tasks?due=${todayStr}`);
//         console.log("✅ DailyPlan TASKS SUCCESS:", res.status);
//         return res.data as Task[];
//       } catch (err: any) {
//         if (err?.response?.status === 401) {
//           await logout();
//           return [];
//         }
//         console.log("❌ DailyPlan TASKS error:", {
//           msg: err?.message,
//           status: err?.response?.status,
//           url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
//           data: err?.response?.data,
//         });
//         throw err;
//       }
//     },
//   });

//   // -----------------------------
//   // PLAN QUERY (PlanResponseDto)
//   // -----------------------------
//   const planQuery = useQuery<PlanResponseDto | null>({
//     queryKey: ["plan", "today", todayStr],
//     enabled: isAuthed,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     queryFn: async () => {
//       try {
//         // ✅ calls: GET /api/dailyplan/{date}
//         const res = await api.get(`/dailyplan/${todayStr}`);
//         console.log("✅ DailyPlan PLAN SUCCESS:", res.status);
//         return res.data as PlanResponseDto;
//       } catch (err: any) {
//         if (err?.response?.status === 404) return null;

//         if (err?.response?.status === 401) {
//           await logout();
//           return null;
//         }

//         console.log("❌ DailyPlan PLAN error:", {
//           msg: err?.message,
//           status: err?.response?.status,
//           url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
//           data: err?.response?.data,
//         });
//         throw err;
//       }
//     },
//   });

//   const backgroundColor =
//     theme?.colors?.background || MD3LightTheme.colors.background;

//   // ✅ AFTER hooks: safe early return
//   if (loading) {
//     return (
//       <SafeAreaView
//         style={StyleSheet.flatten([styles.safe, { backgroundColor }])}
//       >
//         <View
//           style={StyleSheet.flatten([
//             styles.container,
//             { justifyContent: "center", alignItems: "center" },
//           ])}
//         >
//           <Text style={{ color: theme.colors.onBackground }}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!token) return null;

//   const tasks = tasksQuery.data || [];
//   const plan = planQuery.data;

//   // -----------------------------
//   // Generate plan (shared)
//   // -----------------------------
//   const doGenerate = async () => {
//     if (generating) return;

//     try {
//       setGenerating(true);

//       const res = await generateTodayPlan();

//       // ✅ refetch both so UI updates
//       await Promise.all([tasksQuery.refetch(), planQuery.refetch()]);

//       Alert.alert("Plan generated ✅", res?.message ?? "Today's plan is ready.");
//     } catch (err: any) {
//       console.log("[PLAN] generate failed:", {
//         msg: err?.message,
//         status: err?.response?.status,
//         data: err?.response?.data,
//         url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
//       });

//       Alert.alert(
//         "Generate failed",
//         err?.response?.data?.message ??
//           err?.response?.data ??
//           "Could not generate plan."
//       );
//     } finally {
//       setGenerating(false);
//     }
//   };

//   // -----------------------------
//   // Generate button handler
//   // -----------------------------
//   const onGeneratePlan = () => {
//     if (generating) return;

//     // ✅ You wanted "generate even if no tasks" — so we ASK user
//     if (tasks.length === 0) {
//       Alert.alert(
//         "No tasks today",
//         "Do you want to generate a light routine plan anyway, or add tasks first?",
//         [
//           { text: "Add Task", onPress: () => router.push("/tasks") },
//           {
//             text: "Generate anyway",
//             onPress: () => void doGenerate(),
//             style: "destructive",
//           },
//           { text: "Cancel", style: "cancel" },
//         ]
//       );
//       return;
//     }

//     void doGenerate();
//   };

//   // -----------------------------
//   // Plan item renderer (PlanItemDto)
//   // -----------------------------
//   const renderPlanItem = (it: PlanItemDto) => {
//     const start = it.start ? dayjs(it.start).format("h:mm A") : "--";
//     const end = it.end ? dayjs(it.end).format("h:mm A") : "--";
//     const nudge = it.nudgeAt ? dayjs(it.nudgeAt).format("h:mm A") : null;

//     return (
//       <Card
//         key={String(it.itemId)}
//         mode="elevated"
//         style={StyleSheet.flatten([
//           styles.card,
//           {
//             backgroundColor: theme.colors.surface,
//             shadowColor: theme.colors.primary + "33",
//           },
//         ])}
//       >
//         <Card.Content style={StyleSheet.flatten([{ paddingVertical: 10 }])}>
//           <Text
//             style={StyleSheet.flatten([
//               styles.taskTitle,
//               { color: theme.colors.onSurface },
//             ])}
//           >
//             {it.label}
//           </Text>

//           <Text
//             style={StyleSheet.flatten([
//               styles.taskTime,
//               { color: theme.colors.primary },
//             ])}
//           >
//             {start} – {end}
//           </Text>

//           {nudge && (
//             <Text style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
//               🔔 Nudge at {nudge}
//             </Text>
//           )}

//           <Text style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
//             ⭐ Confidence: {it.confidence}/5
//           </Text>
//         </Card.Content>

//         {it.taskId ? (
//           <Card.Actions style={{ justifyContent: "flex-end" }}>
//             <Link href={`/tasks/${it.taskId}`} asChild>
//               <Button
//                 mode="outlined"
//                 textColor={theme.colors.primary}
//                 style={StyleSheet.flatten([
//                   styles.openBtn,
//                   { borderColor: theme.colors.primary },
//                 ])}
//                 labelStyle={StyleSheet.flatten([{ fontWeight: "600" }])}
//               >
//                 Open Task
//               </Button>
//             </Link>
//           </Card.Actions>
//         ) : null}
//       </Card>
//     );
//   };

//   // ✅ IMPORTANT CHANGE: plan.timeline (not plan.items)
//   const planItems = plan?.timeline?.length
//     ? [...plan.timeline].sort(
//         (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
//       )
//     : [];

//   const planLoading = planQuery.isLoading || planQuery.isFetching;

//   return (
//     <SafeAreaView
//       style={StyleSheet.flatten([styles.safe, { backgroundColor }])}
//     >
//       <View style={StyleSheet.flatten([styles.container])}>
//         {/* Header */}
//         <View style={StyleSheet.flatten([styles.headerRow])}>
//           <IconButton
//             icon="calendar-month"
//             iconColor={theme.colors.primary}
//             size={28}
//           />
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
//             { marginBottom: 12, opacity: 0.15, backgroundColor: theme.colors.outline },
//           ])}
//         />

//         {/* Generate / Regenerate */}
//         <View style={{ marginBottom: 12 }}>
//           <Button
//             mode="contained"
//             icon="robot"
//             onPress={onGeneratePlan}
//             disabled={generating}
//             style={{ borderRadius: 14 }}
//           >
//             {generating
//               ? "Generating..."
//               : plan
//               ? "Regenerate Today Plan"
//               : "Generate Today Plan"}
//           </Button>

//           {(generating || tasksQuery.isFetching || planQuery.isFetching) && (
//             <View style={{ marginTop: 10 }}>
//               <ActivityIndicator />
//             </View>
//           )}
//         </View>

//         {/* Plan Timeline */}
//         <View style={{ marginBottom: 12 }}>
//           <Text
//             style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground }}
//           >
//             Plan Timeline
//           </Text>

//           {planLoading ? (
//             <View style={{ paddingVertical: 12 }}>
//               <ActivityIndicator />
//             </View>
//           ) : plan && planItems.length > 0 ? (
//             <View style={{ marginTop: 10 }}>
//               {plan.focus ? (
//                 <Text style={{ marginBottom: 10, color: theme.colors.onSurfaceVariant }}>
//                   🎯 {plan.focus}
//                 </Text>
//               ) : null}
//               {planItems.map(renderPlanItem)}
//             </View>
//           ) : (
//             <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
//               No plan generated yet. Tap “Generate Today Plan”.
//             </Text>
//           )}
//         </View>

//         <Divider style={{ marginBottom: 12, opacity: 0.12 }} />

//         {/* Tasks Due Today */}
//         <Text
//           style={{
//             fontSize: 16,
//             fontWeight: "700",
//             color: theme.colors.onBackground,
//             marginBottom: 10,
//           }}
//         >
//           Tasks Due Today
//         </Text>

//         <FlatList
//           data={tasks}
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
//             <View style={StyleSheet.flatten([{ alignItems: "center", marginTop: 60 }])}>
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
import { Link, router } from "expo-router";
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

export type PlanItemDto = {
  itemId: number;
  taskId: number | null;
  label: string;
  start: string; // ISO string
  end: string; // ISO string
  confidence: number;
  nudgeAt: string | null; // ISO string or null
};

export type PlanResponseDto = {
  planId: number;
  date: string; // "yyyy-MM-dd"
  focus: string;
  timeline: PlanItemDto[];
  carryOver: number[];
  rawJson?: string | null;
  prettyJson?: string | null;
};

export default function DailyPlan() {
  const theme = useTheme();
  const { token, loading, logout } = useAuth();

  const today = useMemo(() => dayjs().startOf("day"), []);
  const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

  const isAuthed = !!token && !loading;
  const [generating, setGenerating] = useState(false);

  // -----------------------------
  // TASKS QUERY (due today)
  // -----------------------------
  const tasksQuery = useQuery({
    queryKey: ["tasks", "today", todayStr],
    enabled: isAuthed,
    refetchOnMount: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      try {
        const res = await api.get(`/tasks?due=${todayStr}`);
        return res.data as Task[];
      } catch (err: any) {
        if (err?.response?.status === 401) {
          await logout();
          return [];
        }
        console.log("❌ DailyPlan TASKS error:", {
          msg: err?.message,
          status: err?.response?.status,
          url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
          data: err?.response?.data,
        });
        throw err;
      }
    },
  });

  // -----------------------------
  // PLAN QUERY (PlanResponseDto)
  // -----------------------------
  const planQuery = useQuery<PlanResponseDto | null>({
    queryKey: ["plan", "today", todayStr],
    enabled: isAuthed,
    refetchOnMount: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      try {
        const res = await api.get(`/dailyplan/${todayStr}`);
        return res.data as PlanResponseDto;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;

        if (err?.response?.status === 401) {
          await logout();
          return null;
        }

        console.log("❌ DailyPlan PLAN error:", {
          msg: err?.message,
          status: err?.response?.status,
          url: (err?.config?.baseURL || "") + (err?.config?.url || ""),
          data: err?.response?.data,
        });
        throw err;
      }
    },
  });

  const backgroundColor =
    theme?.colors?.background || MD3LightTheme.colors.background;

  if (loading) {
    return (
      <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
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

  if (!token) return null;

  const tasks = tasksQuery.data || [];
  const plan = planQuery.data;

  const doGenerate = async () => {
    if (generating) return;

    try {
      setGenerating(true);

      const res = await generateTodayPlan();

      await Promise.all([tasksQuery.refetch(), planQuery.refetch()]);

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
        err?.response?.data?.message ??
          err?.response?.data ??
          "Could not generate plan."
      );
    } finally {
      setGenerating(false);
    }
  };

  const onGeneratePlan = () => {
    if (generating) return;

    if (tasks.length === 0) {
      Alert.alert(
        "No tasks today",
        "Do you want to generate a light routine plan anyway, or add tasks first?",
        [
          { text: "Add Task", onPress: () => router.push("/tasks") },
          { text: "Generate anyway", onPress: () => void doGenerate(), style: "destructive" },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    void doGenerate();
  };

  const planItems = plan?.timeline?.length
    ? [...plan.timeline].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    : [];

  const renderPlanItem = (it: PlanItemDto) => {
    const start = it.start ? dayjs(it.start).format("h:mm A") : "--";
    const end = it.end ? dayjs(it.end).format("h:mm A") : "--";
    const nudge = it.nudgeAt ? dayjs(it.nudgeAt).format("h:mm A") : null;

    return (
      <Card
        key={String(it.itemId)}
        mode="elevated"
        style={StyleSheet.flatten([
          styles.card,
          { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary + "33" },
        ])}
      >
        <Card.Content style={{ paddingVertical: 10 }}>
          <Text style={StyleSheet.flatten([styles.taskTitle, { color: theme.colors.onSurface }])}>
            {it.label}
          </Text>

          <Text style={StyleSheet.flatten([styles.taskTime, { color: theme.colors.primary }])}>
            {start} – {end}
          </Text>

          {nudge && (
            <Text style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
              🔔 Nudge at {nudge}
            </Text>
          )}

          <Text style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
            ⭐ Confidence: {it.confidence}/5
          </Text>
        </Card.Content>

        {it.taskId ? (
          <Card.Actions style={{ justifyContent: "flex-end" }}>
            <Link href={`/tasks/${it.taskId}`} asChild>
              <Button
                mode="outlined"
                textColor={theme.colors.primary}
                style={StyleSheet.flatten([styles.openBtn, { borderColor: theme.colors.primary }])}
                labelStyle={{ fontWeight: "600" }}
              >
                Open Task
              </Button>
            </Link>
          </Card.Actions>
        ) : null}
      </Card>
    );
  };

  const planLoading = planQuery.isLoading || planQuery.isFetching;

  // ✅ WORLD-BEST FIX: One FlatList for entire page scrolling
  const ListHeader = (
    <View>
      {/* Header */}
      <View style={styles.headerRow}>
        <IconButton icon="calendar-month" iconColor={theme.colors.primary} size={28} />
        <Text
          variant="headlineMedium"
          style={StyleSheet.flatten([styles.headerTitle, { color: theme.colors.onBackground }])}
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
        style={{ marginBottom: 12, opacity: 0.15, backgroundColor: theme.colors.outline }}
      />

      {/* Generate / Regenerate */}
      <View style={{ marginBottom: 12 }}>
        <Button
          mode="contained"
          icon="robot"
          onPress={onGeneratePlan}
          disabled={generating}
          style={{ borderRadius: 14 }}
        >
          {generating
            ? "Generating..."
            : plan
            ? "Regenerate Today Plan"
            : "Generate Today Plan"}
        </Button>

        {(generating || tasksQuery.isFetching || planQuery.isFetching) && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        )}
      </View>

      {/* Plan Timeline */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground }}>
          Plan Timeline
        </Text>

        {planLoading ? (
          <View style={{ paddingVertical: 12 }}>
            <ActivityIndicator />
          </View>
        ) : plan && planItems.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            {plan.focus ? (
              <Text style={{ marginBottom: 10, color: theme.colors.onSurfaceVariant }}>
                🎯 {plan.focus}
              </Text>
            ) : null}
            {planItems.map(renderPlanItem)}
          </View>
        ) : (
          <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
            No plan generated yet. Tap “Generate Today Plan”.
          </Text>
        )}
      </View>

      <Divider style={{ marginBottom: 12, opacity: 0.12 }} />

      {/* Tasks section title */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: theme.colors.onBackground,
          marginBottom: 10,
        }}
      >
        Tasks Due Today
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
      <View style={styles.container}>
        <FlatList
          data={tasks}
          keyExtractor={(t) => String(t.id)}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Card
              mode="elevated"
              style={StyleSheet.flatten([
                styles.card,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.primary + "33" },
              ])}
            >
              <Card.Content style={{ paddingVertical: 8 }}>
                <Text style={StyleSheet.flatten([styles.taskTitle, { color: theme.colors.onSurface }])}>
                  {item.title}
                </Text>

                <Text style={StyleSheet.flatten([styles.taskTime, { color: theme.colors.primary }])}>
                  {dayjs(item.dueDate).format("h:mm A")}
                </Text>

                <Text style={StyleSheet.flatten([styles.taskDesc, { color: theme.colors.onSurfaceVariant || "#999" }])}>
                  {item.description}
                </Text>
              </Card.Content>

              <Card.Actions style={{ justifyContent: "flex-end" }}>
                <Link href={`/tasks/${item.id}`} asChild>
                  <Button
                    mode="outlined"
                    textColor={theme.colors.primary}
                    style={StyleSheet.flatten([styles.openBtn, { borderColor: theme.colors.primary }])}
                    labelStyle={{ fontWeight: "600" }}
                  >
                    Open
                  </Button>
                </Link>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 24, marginBottom: 40 }}>
              <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.colors.onSurfaceVariant }])}>
                {tasksQuery.isLoading ? "Loading tasks..." : "No tasks for today"}
              </Text>

              <Link href="/tasks" asChild>
                <Button
                  mode="contained"
                  style={StyleSheet.flatten([styles.addBtn, { backgroundColor: theme.colors.primary }])}
                  labelStyle={{ fontWeight: "600", color: theme.colors.onPrimary }}
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
  safe: { flex: 1 },
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
  headerTitle: { fontWeight: "700" },
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
  taskTitle: { fontSize: 17, fontWeight: "600" },
  taskTime: { fontSize: 14, marginTop: 2 },
  taskDesc: { marginTop: 4, fontSize: 14 },
  openBtn: { borderRadius: 30 },
  addBtn: { borderRadius: 25, marginTop: 10 },
  emptyText: { fontSize: 16, marginBottom: 8 },
});
