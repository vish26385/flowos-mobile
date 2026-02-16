import React, { useMemo, useState } from "react";
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
    if (typeof v.message === "string") return v.message;
    if (typeof v.title === "string") return v.title;
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

// ✅ show picker + call the generator with chosen start time (LOCAL IST string)
async function pickPlanStartAndGenerate(
  doGenerateWithStart: (isoLocal: string | null) => Promise<void>
) {
  const now = dayjs();

  // Recommended: 10 min buffer, rounded to 5 min
  const defaultStart = roundUpToMinutes(now.add(10, "minute"), 5);

  const startIn30 = roundUpToMinutes(now.add(30, "minute"), 5);

  const tomorrow9 = dayjs()
    .add(1, "day")
    .hour(9)
    .minute(0)
    .second(0)
    .millisecond(0);

  Alert.alert(
    "Start plan from when?",
    `Choose when today’s plan should start.\n\nDefault: ${defaultStart.format("h:mm A")}`,
    [
      {
        text: `Start at ${defaultStart.format("h:mm A")} (Recommended)`,
        onPress: () =>
          void doGenerateWithStart(defaultStart.format("YYYY-MM-DDTHH:mm:ss")),
      },
      {
        text: `Start in 30 min (${startIn30.format("h:mm A")})`,
        onPress: () =>
          void doGenerateWithStart(startIn30.format("YYYY-MM-DDTHH:mm:ss")),
      },
      {
        text: `Tomorrow 9:00 AM (${tomorrow9.format("ddd")})`,
        onPress: () =>
          void doGenerateWithStart(tomorrow9.format("YYYY-MM-DDTHH:mm:ss")),
      },
      {
        text: "Generate without start time",
        style: "destructive",
        onPress: () => void doGenerateWithStart(null),
      },
      { text: "Cancel", style: "cancel" },
    ]
  );
}

export default function DailyPlan() {
  const theme = useTheme();
  const { token, loading, logout } = useAuth();

  const today = useMemo(() => dayjs().startOf("day"), []);
  const todayStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);

  const isAuthed = !!token && !loading;
  const [generating, setGenerating] = useState(false);

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

  const backgroundColor =
    theme?.colors?.background || MD3LightTheme.colors.background;

  if (loading) {
    return (
      <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
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

  // ✅ generator with optional planStartLocal (IST local string)
  const doGenerate = async (planStartLocal: string | null) => {
    if (generating) return;

    try {
      setGenerating(true);

      let res: any = null;

      try {
        // ✅ IMPORTANT: send date always, and planStartLocal if chosen
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
      } catch {
        // ignore
      }

      const okMsg = toAlertText(res?.message) || "Today's plan is ready.";
      Alert.alert("Plan generated ✅", okMsg);
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
          {
            text: "Generate anyway",
            onPress: () => void pickPlanStartAndGenerate(doGenerate),
            style: "destructive",
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    void pickPlanStartAndGenerate(doGenerate);
  };

  const renderPlanItem = (it: PlanItemDto) => {
    const start = it.start ? dayjs(it.start).format("h:mm A") : "--";
    const end = it.end ? dayjs(it.end).format("h:mm A") : "--";
    const nudge = it.nudgeAt ? dayjs(it.nudgeAt).format("h:mm A") : null;

    return (
      <Card
        key={String(it.itemId ?? `${it.taskId ?? "x"}-${it.start}`)}
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

  const renderTask = (item: Task) => {
    return (
      <Card
        key={String(item.id)}
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

          <Text
            style={StyleSheet.flatten([
              styles.taskDesc,
              { color: theme.colors.onSurfaceVariant || "#999" },
            ])}
          >
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
    );
  };

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safe, { backgroundColor }])}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={StyleSheet.flatten([styles.container, { paddingBottom: 24 }])}
      >
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

        <Divider bold style={{ marginBottom: 12, opacity: 0.15, backgroundColor: theme.colors.outline }} />

        {/* Generate */}
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

          {(generating || tasksQuery.isFetching || planQuery.isFetching) && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator />
            </View>
          )}
        </View>

        {/* Plan timeline */}
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground }}>
          Plan Timeline
        </Text>

        {planQuery.isLoading || planQuery.isFetching ? (
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

        {/* Tasks */}
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.onBackground, marginBottom: 10 }}>
          Tasks Due Today
        </Text>

        {tasks.length > 0 ? (
          tasks.map(renderTask)
        ) : (
          <View style={{ alignItems: "center", marginTop: 18, marginBottom: 40 }}>
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
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
});

