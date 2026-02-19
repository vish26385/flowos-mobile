// import React, { useMemo, useState, useCallback } from "react";
// import { View, Platform, StyleSheet, Alert, ScrollView } from "react-native";
// import {
//   Text,
//   Card,
//   Button,
//   IconButton,
//   Divider,
//   useTheme,
//   MD3LightTheme,
//   ActivityIndicator,
//   Portal,
//   Modal,
//   Surface,
//   Dialog,
// } from "react-native-paper";
// import { SafeAreaView } from "react-native-safe-area-context";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";

// dayjs.extend(utc);
// const IST_OFFSET_MINUTES = 330;

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

// export type PlanItemDto = {
//   itemId: number;
//   taskId: number | null;
//   label: string;
//   start: string;
//   end: string;
//   confidence: number;
//   nudgeAt: string | null;
// };

// export type PlanResponseDto = {
//   planId: number;
//   date: string;
//   focus: string;
//   timeline: PlanItemDto[];
//   carryOver: number[];
//   rawJson?: string | null;
//   prettyJson?: string | null;
// };

// function toAlertText(v: any): string {
//   if (v == null) return "";
//   if (typeof v === "string") return v;
//   if (typeof v === "number" || typeof v === "boolean") return String(v);

//   if (typeof v === "object") {
//     if (typeof (v as any).message === "string") return (v as any).message;
//     if (typeof (v as any).title === "string") return (v as any).title;
//     try {
//       const s = JSON.stringify(v);
//       return s.length > 500 ? s.slice(0, 500) + "..." : s;
//     } catch {
//       return "Unknown error";
//     }
//   }
//   return "Unknown error";
// }

// // ✅ rounds up a Dayjs time to nearest N minutes
// function roundUpToMinutes(d: dayjs.Dayjs, m: number) {
//   const ms = m * 60 * 1000;
//   return dayjs(Math.ceil(d.valueOf() / ms) * ms);
// }

// export default function DailyPlan() {
//   const theme = useTheme();
//   const { token, loading, logout } = useAuth();

//   //const today = useMemo(() => dayjs().startOf("day"), []);
//   //const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);  

//   // ✅ Always compute "today" in IST (not device default, not UTC)
//   const istNow = dayjs().utcOffset(IST_OFFSET_MINUTES);
//   const today = istNow.startOf("day");
//   const todayStr = today.format("YYYY-MM-DD");
//   // const istNow = useMemo(() => dayjs().utcOffset(IST_OFFSET_MINUTES), []);
//   // const today = useMemo(() => istNow.startOf("day"), [istNow]);
//   // const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

//   const isAuthed = !!token && !loading;
//   const [generating, setGenerating] = useState(false);

//   // ✅ Dialog state (works on Android + iOS; no 3-button limitation)
//   const [startPickerOpen, setStartPickerOpen] = useState(false);

//   // Precompute choices when dialog opens (fresh every time)
//   const now = dayjs();
//   const defaultStart = roundUpToMinutes(now.add(10, "minute"), 5);
//   // ✅ NEW: ASAP: 5 min buffer, rounded to 5 min
//   const asapStart = roundUpToMinutes(now.add(5, "minute"), 5);
//   const startIn30 = roundUpToMinutes(now.add(30, "minute"), 5);
//   const tomorrow9 = dayjs()
//     .add(1, "day")
//     .hour(9)
//     .minute(0)
//     .second(0)
//     .millisecond(0);

//   // IMPORTANT: include timezone offset so backend can parse correctly
//   const fmtWithOffset = (d: dayjs.Dayjs) => d.format("YYYY-MM-DDTHH:mm:ssZ");

//   // TASKS
//   const tasksQuery = useQuery({
//     queryKey: ["tasks", "today", todayStr],
//     enabled: isAuthed,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     queryFn: async () => {
//       try {
//         const res = await api.get(`/tasks?due=${todayStr}`);
//         return res.data as Task[];
//       } catch (err: any) {
//         if (err?.response?.status === 401) {
//           await logout();
//           return [];
//         }
//         throw err;
//       }
//     },
//   });

//   // PLAN
//   const planQuery = useQuery<PlanResponseDto | null>({
//     queryKey: ["plan", "today", todayStr],
//     enabled: isAuthed,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//     queryFn: async () => {
//       try {
//         const res = await api.get(`/dailyplan/${todayStr}`);
//         return res.data as PlanResponseDto;
//       } catch (err: any) {
//         if (err?.response?.status === 404) return null;
//         if (err?.response?.status === 401) {
//           await logout();
//           return null;
//         }
//         throw err;
//       }
//     },
//   });

//   const backgroundColor =
//     theme?.colors?.background || MD3LightTheme.colors.background;

//   if (loading) {
//     return (
//       <SafeAreaView
//         style={StyleSheet.flatten([styles.safe, { backgroundColor }])}
//       >
//         <View
//           style={[
//             styles.container,
//             { justifyContent: "center", alignItems: "center" },
//           ]}
//         >
//           <Text style={{ color: theme.colors.onBackground }}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!token) return null;

//   const tasks = tasksQuery.data || [];
//   const plan = planQuery.data;

//   const planItems = plan?.timeline?.length
//     ? [...plan.timeline].sort(
//         (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
//       )
//     : [];

//   // ✅ generator with optional planStartLocal (string with offset)
//   const doGenerate = useCallback(
//     async (planStartLocal: string | null) => {
//       if (generating) return;

//       try {
//         setGenerating(true);

//         let res: any = null;

//         try {
//           // ✅ IMPORTANT: send date always, and planStartLocal if chosen
//           res = await generateTodayPlan(todayStr, planStartLocal ?? undefined);
//         } catch (e: any) {
//           const msg =
//             toAlertText(e?.response?.data?.message) ||
//             toAlertText(e?.response?.data) ||
//             toAlertText(e?.message) ||
//             "Could not generate plan.";
//           Alert.alert("Generate failed", msg);
//           return;
//         }

//         try {
//           await Promise.all([tasksQuery.refetch(), planQuery.refetch()]);
//         } catch {
//           // ignore
//         }

//         const okMsg = toAlertText(res?.message) || "Today's plan is ready.";
//         Alert.alert("Plan generated ✅", okMsg);
//       } finally {
//         setGenerating(false);
//       }
//     },
//     [generating, planQuery, tasksQuery, todayStr]
//   );

//   const onGeneratePlan = () => {
//     if (generating) return;

//     if (tasks.length === 0) {
//       Alert.alert(
//         "No tasks today",
//         "Do you want to generate a light routine plan anyway, or add tasks first?",
//         [
//           { text: "Add Task", onPress: () => router.push("/tasks") },
//           {
//             text: "Generate anyway",
//             onPress: () => setStartPickerOpen(true),
//             style: "destructive",
//           },
//           { text: "Cancel", style: "cancel" },
//         ]
//       );
//       return;
//     }

//     setStartPickerOpen(true);
//   };

//   const renderPlanItem = (it: PlanItemDto) => {
//     const start = it.start ? dayjs(it.start).format("h:mm A") : "--";
//     const end = it.end ? dayjs(it.end).format("h:mm A") : "--";
//     const nudge = it.nudgeAt ? dayjs(it.nudgeAt).format("h:mm A") : null;

//     return (
//       <Card
//         key={String(it.itemId ?? `${it.taskId ?? "x"}-${it.start}`)}
//         mode="elevated"
//         style={StyleSheet.flatten([
//           styles.card,
//           {
//             backgroundColor: theme.colors.surface,
//             shadowColor: theme.colors.primary + "33",
//           },
//         ])}
//       >
//         <Card.Content style={{ paddingVertical: 10 }}>
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
//                 labelStyle={{ fontWeight: "600" }}
//               >
//                 Open Task
//               </Button>
//             </Link>
//           </Card.Actions>
//         ) : null}
//       </Card>
//     );
//   };

//   const renderTask = (item: Task) => {
//     return (
//       <Card
//         key={String(item.id)}
//         mode="elevated"
//         style={StyleSheet.flatten([
//           styles.card,
//           {
//             backgroundColor: theme.colors.surface,
//             shadowColor: theme.colors.primary + "33",
//           },
//         ])}
//       >
//         <Card.Content style={{ paddingVertical: 8 }}>
//           <Text
//             style={StyleSheet.flatten([
//               styles.taskTitle,
//               { color: theme.colors.onSurface },
//             ])}
//           >
//             {item.title}
//           </Text>

//           <Text
//             style={StyleSheet.flatten([
//               styles.taskTime,
//               { color: theme.colors.primary },
//             ])}
//           >
//             {dayjs(item.dueDate).format("h:mm A")}
//           </Text>

//           <Text
//             style={StyleSheet.flatten([
//               styles.taskDesc,
//               { color: theme.colors.onSurfaceVariant || "#999" },
//             ])}
//           >
//             {item.description}
//           </Text>
//         </Card.Content>

//         <Card.Actions style={{ justifyContent: "flex-end" }}>
//           <Link href={`/tasks/${item.id}`} asChild>
//             <Button
//               mode="outlined"
//               textColor={theme.colors.primary}
//               style={StyleSheet.flatten([
//                 styles.openBtn,
//                 { borderColor: theme.colors.primary },
//               ])}
//               labelStyle={{ fontWeight: "600" }}
//             >
//               Open
//             </Button>
//           </Link>
//         </Card.Actions>
//       </Card>
//     );
//   };

//   const showSpinner =
//     generating || tasksQuery.isFetching || planQuery.isFetching;

//   return (
//     <SafeAreaView
//       style={StyleSheet.flatten([styles.safe, { backgroundColor }])}
//     >
//       {/* ✅ Start time picker dialog */}
//       <Portal>
//         <Modal
//           visible={startPickerOpen}
//           onDismiss={() => setStartPickerOpen(false)}
//           dismissable
//           contentContainerStyle={styles.modalWrap}
//         >
//           <Surface
//             style={[
//               styles.sheet,
//               { backgroundColor: theme.colors.elevation?.level3 ?? theme.colors.surface },
//             ]}
//             elevation={5}
//           >
//             {/* Title area */}
//             <View style={styles.titleWrap}>
//               <Text style={[styles.title, { color: theme.colors.onSurface }]}>
//                 Start plan from when?
//               </Text>

//               <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
//                 Choose when today’s plan should begin.
//               </Text>
//             </View>

//             <Divider style={{ opacity: 0.12 }} />

//             {/* Buttons */}
//             <View style={styles.btnWrap}>
//               <Button
//                 mode="contained"
//                 style={styles.btn}
//                 contentStyle={styles.btnContentPrimary}
//                 onPress={() => {
//                   setStartPickerOpen(false);
//                   void doGenerate(fmtWithOffset(defaultStart));
//                 }}
//               >
//                 <Text
//                   numberOfLines={1}
//                   ellipsizeMode="clip"
//                   style={styles.btnLabelPrimaryText}
//                 >
//                   Start at {defaultStart.format("h:mm A")} (Recommended)
//                 </Text>
//               </Button>

//               <Button
//                 mode="outlined"
//                 style={styles.btn}
//                 contentStyle={styles.btnContentPrimary} // ✅ same height as first
//                 onPress={() => {
//                   setStartPickerOpen(false);
//                   void doGenerate(fmtWithOffset(startIn30));
//                 }}
//               >
//                 <Text
//                   numberOfLines={1}
//                   ellipsizeMode="clip"
//                   style={[styles.btnLabelPrimaryText, { color: theme.colors.primary }]} // ✅ same font
//                 >
//                   Start in 30 min ({startIn30.format("h:mm A")})
//                 </Text>
//               </Button>

//               <Button
//                 mode="outlined"
//                 style={styles.btn}
//                 contentStyle={styles.btnContentPrimary} // ✅ same height as first
//                 onPress={() => {
//                   setStartPickerOpen(false);
//                   void doGenerate(fmtWithOffset(tomorrow9));
//                 }}
//               >
//                 <Text
//                   numberOfLines={1}
//                   ellipsizeMode="clip"
//                   style={[styles.btnLabelPrimaryText, { color: theme.colors.primary }]} // ✅ same font
//                 >
//                   Tomorrow 9:00 AM ({tomorrow9.format("ddd")})
//                 </Text>
//               </Button>

//               <Button
//                 mode="text"
//                 labelStyle={[styles.btnLabel, { color: theme.colors.primary }]}
//                 onPress={() => {
//                   setStartPickerOpen(false);
//                   void doGenerate(fmtWithOffset(asapStart)); // ✅ 5-min start
//                 }}
//               >
//                 Start ASAP (in ~5 min)
//               </Button>

//               <Divider style={{ opacity: 0.12 }} />

//               <Button
//                 mode="text"
//                 labelStyle={[styles.btnLabel, { color: theme.colors.onSurfaceVariant }]}
//                 onPress={() => setStartPickerOpen(false)}
//               >
//                 Cancel
//               </Button>
//             </View>
//           </Surface>
//         </Modal>
//       </Portal>
      
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={StyleSheet.flatten([
//           styles.container,
//           { paddingBottom: 24 },
//         ])}
//       >
//         {/* Header */}
//         <View style={styles.headerRow}>
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
//           style={{
//             marginBottom: 12,
//             opacity: 0.15,
//             backgroundColor: theme.colors.outline,
//           }}
//         />

//         {/* Generate */}
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

//           {showSpinner && (
//             <View style={{ marginTop: 10 }}>
//               <ActivityIndicator />
//             </View>
//           )}
//         </View>

//         {/* Plan timeline */}
//         <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground }}>
//           Plan Timeline
//         </Text>

//         {planQuery.isLoading ? (
//           <View style={{ paddingVertical: 12 }}>
//             <ActivityIndicator />
//           </View>
//         ) : plan && planItems.length > 0 ? (
//           <View style={{ marginTop: 10 }}>
//             {plan.focus ? (
//               <Text style={{ marginBottom: 10, color: theme.colors.onSurfaceVariant }}>
//                 🎯 {plan.focus}
//               </Text>
//             ) : null}
//             {planItems.map(renderPlanItem)}
//           </View>
//         ) : (
//           <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
//             No plan generated yet. Tap “Generate Today Plan”.
//           </Text>
//         )}

//         <Divider style={{ marginBottom: 12, marginTop: 10, opacity: 0.12 }} />

//         {/* Tasks */}
//         <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground, marginBottom: 10 }}>
//           Tasks Due Today
//         </Text>

//         {tasks.length > 0 ? (
//           tasks.map(renderTask)
//         ) : (
//           <View style={{ alignItems: "center", marginTop: 18, marginBottom: 40 }}>
//             <Text
//               style={StyleSheet.flatten([
//                 styles.emptyText,
//                 { color: theme.colors.onSurfaceVariant },
//               ])}
//             >
//               {tasksQuery.isLoading ? "Loading tasks..." : "No tasks for today"}
//             </Text>

//             <Link href="/tasks" asChild>
//               <Button
//                 mode="contained"
//                 style={StyleSheet.flatten([
//                   styles.addBtn,
//                   { backgroundColor: theme.colors.primary },
//                 ])}
//                 labelStyle={{ fontWeight: "600", color: theme.colors.onPrimary }}
//               >
//                 Add Task
//               </Button>
//             </Link>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1 },
//   container: {
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === "android" ? 0 : 0,
//   },
//   headerRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
//   headerTitle: { fontWeight: "700" },
//   dateText: { fontSize: 15, marginLeft: 8, marginBottom: 8 },
//   card: { marginBottom: 14, borderRadius: 18, elevation: 3 },
//   taskTitle: { fontSize: 17, fontWeight: "600" },
//   taskTime: { fontSize: 14, marginTop: 2 },
//   taskDesc: { marginTop: 4, fontSize: 14 },
//   openBtn: { borderRadius: 30 },
//   addBtn: { borderRadius: 25, marginTop: 10 },
//   emptyText: { fontSize: 16, marginBottom: 8 },
//     // ✅ centers dialog + adds dark scrim effect via modal container background
//   modalWrap: {
//     paddingHorizontal: 18,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.65)", // ✅ backdrop
//     flex: 1,
//   },
//   sheet: {
//     borderRadius: 28,
//     overflow: "hidden",
//   },
//   titleWrap: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 12 },
//   title: { fontSize: 22, fontWeight: "800" },
//   subtitle: { marginTop: 8, fontSize: 14, lineHeight: 20 },

//   btnWrap: { padding: 16, gap: 12 },
//   btn: {
//   borderRadius: 16,
// },

// // btnContent: {
// //   paddingVertical: 12,     // auto height
// //   paddingHorizontal: 12,
// // },

// btnLabel: {
//   fontWeight: "800",
//   fontSize: 14,
//   lineHeight: 18,
//   textAlign: "center",
//   flexShrink: 1,
//   flexWrap: "wrap",
// },

// btnContentPrimary: {
//   minHeight: 56,
//   paddingHorizontal: 6,      // tighter so text fits
//   justifyContent: "center",
//   alignItems: "center",
// },

// btnLabelPrimaryText: {
//   fontWeight: "900",
//   fontSize: 13.5,            // 🔑 slightly smaller = fits perfectly
//   lineHeight: 18,
//   textAlign: "center",
// },
// });

import React, { useMemo, useState, useCallback } from "react";
import { View, Platform, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
  useTheme,
  MD3LightTheme,
  ActivityIndicator,
  Portal,
  Modal,
  Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { generateTodayPlan } from "@/services/planner";

dayjs.extend(utc);
const IST_OFFSET_MINUTES = 330;

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
  start: string;
  end: string;
  confidence: number;
  nudgeAt: string | null;
};

export type PlanResponseDto = {
  planId: number;
  date: string;
  focus: string;
  timeline: PlanItemDto[];
  carryOver: number[];
  rawJson?: string | null;
  prettyJson?: string | null;
};

function toAlertText(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);

  if (typeof v === "object") {
    if (typeof (v as any).message === "string") return (v as any).message;
    if (typeof (v as any).title === "string") return (v as any).title;
    try {
      const s = JSON.stringify(v);
      return s.length > 500 ? s.slice(0, 500) + "..." : s;
    } catch {
      return "Unknown error";
    }
  }
  return "Unknown error";
}

// ✅ rounds up a Dayjs time to nearest N minutes
function roundUpToMinutes(d: dayjs.Dayjs, m: number) {
  const ms = m * 60 * 1000;
  return dayjs(Math.ceil(d.valueOf() / ms) * ms);
}

export default function DailyPlan() {
  const theme = useTheme();
  const { token, loading, logout } = useAuth();

  // ✅ hooks MUST always run (no early returns before these)
  const [generating, setGenerating] = useState(false);
  const [startPickerOpen, setStartPickerOpen] = useState(false);

  const isAuthed = !!token && !loading;

  // ✅ Always compute "today" in IST
  const istNow = useMemo(() => dayjs().utcOffset(IST_OFFSET_MINUTES), []);
  const today = useMemo(() => istNow.startOf("day"), [istNow]);
  const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

  // ✅ recompute choices fresh when modal opens
  const now = useMemo(() => dayjs(), [startPickerOpen]);
  const defaultStart = useMemo(() => roundUpToMinutes(now.add(10, "minute"), 5), [now]);
  const asapStart = useMemo(() => roundUpToMinutes(now.add(5, "minute"), 5), [now]);
  const startIn30 = useMemo(() => roundUpToMinutes(now.add(30, "minute"), 5), [now]);
  const tomorrow9 = useMemo(
    () =>
      dayjs()
        .add(1, "day")
        .hour(9)
        .minute(0)
        .second(0)
        .millisecond(0),
    [now]
  );

  // IMPORTANT: include timezone offset so backend can parse correctly
  const fmtWithOffset = useCallback((d: dayjs.Dayjs) => d.format("YYYY-MM-DDTHH:mm:ssZ"), []);

  // TASKS
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
        throw err;
      }
    },
  });

  // PLAN
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
        throw err;
      }
    },
  });

  // ✅ MUST be before any early returns
  const doGenerate = useCallback(
    async (planStartLocal: string | null) => {
      if (generating) return;

      try {
        setGenerating(true);

        let res: any = null;
        try {
          res = await generateTodayPlan(todayStr, planStartLocal ?? undefined);
        } catch (e: any) {
          const msg =
            toAlertText(e?.response?.data?.message) ||
            toAlertText(e?.response?.data) ||
            toAlertText(e?.message) ||
            "Could not generate plan.";
          Alert.alert("Generate failed", msg);
          return;
        }

        try {
          await Promise.all([tasksQuery.refetch(), planQuery.refetch()]);
        } catch {}

        const okMsg = toAlertText(res?.message) || "Today's plan is ready.";
        Alert.alert("Plan generated ✅", okMsg);
      } finally {
        setGenerating(false);
      }
    },
    [generating, tasksQuery, planQuery, todayStr]
  );

  const backgroundColor = theme?.colors?.background || MD3LightTheme.colors.background;

  // ✅ NOW it is safe to early return (hooks already executed)
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: theme.colors.onBackground }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token) return null;

  const tasks = tasksQuery.data || [];
  const plan = planQuery.data;

  const planItems = plan?.timeline?.length
    ? [...plan.timeline].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    : [];

  const onGeneratePlan = () => {
    if (generating) return;

    if (tasks.length === 0) {
      Alert.alert(
        "No tasks today",
        "Do you want to generate a light routine plan anyway, or add tasks first?",
        [
          { text: "Add Task", onPress: () => router.push("/tasks") },
          {
            text: "Generate anyway",
            onPress: () => setStartPickerOpen(true),
            style: "destructive",
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    setStartPickerOpen(true);
  };

  const renderPlanItem = (it: PlanItemDto) => {
    const start = it.start ? dayjs(it.start).format("h:mm A") : "--";
    const end = it.end ? dayjs(it.end).format("h:mm A") : "--";
    const nudge = it.nudgeAt ? dayjs(it.nudgeAt).format("h:mm A") : null;

    return (
      <Card
        key={String(it.itemId ?? `${it.taskId ?? "x"}-${it.start}`)}
        mode="elevated"
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.primary + "33",
          },
        ]}
      >
        <Card.Content style={{ paddingVertical: 10 }}>
          <Text style={[styles.taskTitle, { color: theme.colors.onSurface }]}>{it.label}</Text>

          <Text style={[styles.taskTime, { color: theme.colors.primary }]}>
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
                style={[styles.openBtn, { borderColor: theme.colors.primary }]}
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

  const renderTask = (item: Task) => {
    return (
      <Card
        key={String(item.id)}
        mode="elevated"
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.primary + "33",
          },
        ]}
      >
        <Card.Content style={{ paddingVertical: 8 }}>
          <Text style={[styles.taskTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>

          <Text style={[styles.taskTime, { color: theme.colors.primary }]}>
            {dayjs(item.dueDate).format("h:mm A")}
          </Text>

          <Text style={[styles.taskDesc, { color: theme.colors.onSurfaceVariant || "#999" }]}>
            {item.description}
          </Text>
        </Card.Content>

        <Card.Actions style={{ justifyContent: "flex-end" }}>
          <Link href={`/tasks/${item.id}`} asChild>
            <Button
              mode="outlined"
              textColor={theme.colors.primary}
              style={[styles.openBtn, { borderColor: theme.colors.primary }]}
              labelStyle={{ fontWeight: "600" }}
            >
              Open
            </Button>
          </Link>
        </Card.Actions>
      </Card>
    );
  };

  const showSpinner = generating || tasksQuery.isFetching || planQuery.isFetching;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      {/* ✅ Start time picker dialog */}
      <Portal>
        <Modal
          visible={startPickerOpen}
          onDismiss={() => setStartPickerOpen(false)}
          dismissable
          contentContainerStyle={styles.modalWrap}
        >
          <Surface
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.elevation?.level3 ?? theme.colors.surface },
            ]}
            elevation={5}
          >
            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Start plan from when?
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Choose when today’s plan should begin.
              </Text>
            </View>

            <Divider style={{ opacity: 0.12 }} />

            <View style={styles.btnWrap}>
              <Button
                mode="contained"
                style={styles.btn}
                contentStyle={styles.btnContentPrimary}
                onPress={() => {
                  setStartPickerOpen(false);
                  void doGenerate(fmtWithOffset(defaultStart));
                }}
              >
                <Text numberOfLines={1} ellipsizeMode="clip" style={styles.btnLabelPrimaryText}>
                  Start at {defaultStart.format("h:mm A")} (Recommended)
                </Text>
              </Button>

              <Button
                mode="outlined"
                style={styles.btn}
                contentStyle={styles.btnContentPrimary}
                onPress={() => {
                  setStartPickerOpen(false);
                  void doGenerate(fmtWithOffset(startIn30));
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  style={[styles.btnLabelPrimaryText, { color: theme.colors.primary }]}
                >
                  Start in 30 min ({startIn30.format("h:mm A")})
                </Text>
              </Button>

              <Button
                mode="outlined"
                style={styles.btn}
                contentStyle={styles.btnContentPrimary}
                onPress={() => {
                  setStartPickerOpen(false);
                  void doGenerate(fmtWithOffset(tomorrow9));
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  style={[styles.btnLabelPrimaryText, { color: theme.colors.primary }]}
                >
                  Tomorrow 9:00 AM ({tomorrow9.format("ddd")})
                </Text>
              </Button>

              <Button
                mode="text"
                labelStyle={[styles.btnLabel, { color: theme.colors.primary }]}
                onPress={() => {
                  setStartPickerOpen(false);
                  void doGenerate(fmtWithOffset(asapStart));
                }}
              >
                Start ASAP (in ~5 min)
              </Button>

              <Divider style={{ opacity: 0.12 }} />

              <Button
                mode="text"
                labelStyle={[styles.btnLabel, { color: theme.colors.onSurfaceVariant }]}
                onPress={() => setStartPickerOpen(false)}
              >
                Cancel
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: 24 }]}
      >
        <View style={styles.headerRow}>
          <IconButton icon="calendar-month" iconColor={theme.colors.primary} size={28} />
          <Text
            variant="headlineMedium"
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Today’s Plan
          </Text>
        </View>

        <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant || theme.colors.onSurface }]}>
          {today.format("dddd, D MMM YYYY")}
        </Text>

        <Divider
          bold
          style={{
            marginBottom: 12,
            opacity: 0.15,
            backgroundColor: theme.colors.outline,
          }}
        />

        <View style={{ marginBottom: 12 }}>
          <Button
            mode="contained"
            icon="robot"
            onPress={onGeneratePlan}
            disabled={generating}
            style={{ borderRadius: 14 }}
          >
            {generating ? "Generating..." : plan ? "Regenerate Today Plan" : "Generate Today Plan"}
          </Button>

          {showSpinner && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator />
            </View>
          )}
        </View>

        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground }}>
          Plan Timeline
        </Text>

        {planQuery.isLoading ? (
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

        <Divider style={{ marginBottom: 12, marginTop: 10, opacity: 0.12 }} />

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

        {tasks.length > 0 ? (
          tasks.map(renderTask)
        ) : (
          <View style={{ alignItems: "center", marginTop: 18, marginBottom: 40 }}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {tasksQuery.isLoading ? "Loading tasks..." : "No tasks for today"}
            </Text>

            <Link href="/tasks" asChild>
              <Button
                mode="contained"
                style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ fontWeight: "600", color: theme.colors.onPrimary }}
              >
                Add Task
              </Button>
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 0 : 0 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  headerTitle: { fontWeight: "700" },
  dateText: { fontSize: 15, marginLeft: 8, marginBottom: 8 },
  card: { marginBottom: 14, borderRadius: 18, elevation: 3 },
  taskTitle: { fontSize: 17, fontWeight: "600" },
  taskTime: { fontSize: 14, marginTop: 2 },
  taskDesc: { marginTop: 4, fontSize: 14 },
  openBtn: { borderRadius: 30 },
  addBtn: { borderRadius: 25, marginTop: 10 },
  emptyText: { fontSize: 16, marginBottom: 8 },

  modalWrap: {
    paddingHorizontal: 18,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    flex: 1,
  },
  sheet: { borderRadius: 28, overflow: "hidden" },
  titleWrap: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 20 },

  btnWrap: { padding: 16, gap: 12 },
  btn: { borderRadius: 16 },

  btnLabel: {
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },

  btnContentPrimary: {
    minHeight: 56,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  btnLabelPrimaryText: {
    fontWeight: "900",
    fontSize: 13.5,
    lineHeight: 18,
    textAlign: "center",
  },
});