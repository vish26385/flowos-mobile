import React, { useState } from "react";
import * as Print from "expo-print";
import {
  ScrollView,
  Pressable,
  LayoutAnimation,
  Dimensions,
  View,
  Alert,
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  ActivityIndicator,
  useTheme,
  Divider,
  Button,
} from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const screenWidth = Dimensions.get("window").width - 60;
//const cacheDir = (FileSystem as any).cacheDirectory ?? "/";   // Safe fallback

/** 🌈 Animated Count Component */
const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);

  React.useEffect(() => {
    let frame = 0;
    const totalFrames = 18;
    const step = value / totalFrames;

    const timer = setInterval(() => {
      frame++;
      setDisplay(Number((step * frame).toFixed(2)));
      if (frame >= totalFrames) clearInterval(timer);
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return <Text>{display}</Text>;
};

export default function AuditDashboard() {
  const { token, loading } = useAuth();
  const theme = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  if (loading || !token) return <ActivityIndicator style={{ marginTop: 40 }} />;

  /** 🧠 Stats */
  const statsQuery = useQuery({
    queryKey: ["audit", "stats"],
    queryFn: async () => (await api.get("/audit/stats")).data,
  });

  /** 🧠 Last 20 plan logs */
  const recentQuery = useQuery({
    queryKey: ["audit", "recent"],
    queryFn: async () => (await api.get("/audit/recent")).data,
  });

  if (statsQuery.isLoading || recentQuery.isLoading)
    return <ActivityIndicator style={{ marginTop: 40 }} />;

  const stats = statsQuery.data;
  const recent: any[] = recentQuery.data ?? [];
  const chartHeight = recent.length <= 1 ? 120 : 220;

  /** ⭐ AI SCORE LOGIC */
  const scoreColor =
    stats.avgConfidence >= 4.5
      ? "#24D45A" // Green
      : stats.avgConfidence >= 3.5
      ? "#FFB300" // Yellow
      : "#E63946"; // Red

  const scoreLabel =
    stats.avgConfidence >= 4.5
      ? "EXCELLENT"
      : stats.avgConfidence >= 3.5
      ? "GOOD"
      : "NEEDS IMPROVEMENT";

/** 📁 EXPORT CSV - Works on WEB + MOBILE */
const handleExportCsv = async () => {
  try {
    const csvContent =
      "UserId,Model,Confidence,Coverage,Latency,Regenerated,Date\n" +
      recent
        .map(
          (it) =>
            `${it.userId},${it.modelUsed},${it.avgConfidence},${it.coveragePercent},${it.latencyMs},${it.wasRegenerated},${new Date(
              it.requestedAt
            ).toISOString()}`
        )
        .join("\n");

    // 🌍 WEB MODE → Download directly
    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `flowos_audit_${Date.now()}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      alert("CSV Downloaded");
      return;
    }

    // 📱 MOBILE → Use expo-file-system + sharing
    const fileUri = FileSystem.documentDirectory + `flowos_audit_${Date.now()}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent);

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("CSV Saved", `File saved at:\n${fileUri}`);
      return;
    }

    await Sharing.shareAsync(fileUri);
  } catch (err) {
    console.error("CSV EXPORT ERROR", err);
    Alert.alert("Export Failed", "Could not export CSV.");
  }
};

  /** 📄 EXPORT PDF - Works on WEB + MOBILE (no backend) */
const handleExportPdf = async () => {
  try {
    const now = new Date();

    const score = Number(stats?.avgConfidence ?? 0);
    const scoreColor =
      score >= 4.5 ? "#24D45A" : score >= 3.5 ? "#FFB300" : "#E63946";
    const scoreLabel =
      score >= 4.5 ? "EXCELLENT" : score >= 3.5 ? "GOOD" : "NEEDS IMPROVEMENT";

    const safe = (v: any) =>
      String(v ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    // ---- mini chart (sparkline) from avgConfidence values (0..5)
    const points = (recent ?? [])
      .slice(0, 20)
      .map((r: any) => Number(r?.avgConfidence ?? 0))
      .reverse(); // older -> newer looks nicer

    const w = 640;
    const h = 140;
    const pad = 12;

    const maxY = 5; // confidence scale
    const minY = 0;

    const toX = (i: number) =>
      pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);

    const toY = (v: number) =>
      pad + (1 - (Math.min(maxY, Math.max(minY, v)) - minY) / (maxY - minY)) * (h - pad * 2);

    const polyline =
      points.length > 1
        ? points.map((v, i) => `${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(" ")
        : "";

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>FlowOS AI Audit Report</title>
        <style>
          body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
          .header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
          .title { font-size: 22px; font-weight: 800; }
          .meta { font-size: 12px; color: #555; margin-top: 4px; }
          .badge { display:inline-block; padding: 6px 10px; border-radius: 999px; color: #fff; font-weight: 800; font-size: 12px; background: ${scoreColor}; }
          .card { border: 1px solid #e5e5e5; border-radius: 14px; padding: 14px; margin-top: 14px; }
          .row { display:flex; flex-wrap: wrap; gap: 10px; }
          .kpi { flex: 1 1 180px; padding: 10px; border-radius: 12px; background: #fafafa; border: 1px solid #eee; }
          .kpi .k { font-size: 11px; color: #666; }
          .kpi .v { font-size: 16px; font-weight: 800; margin-top: 4px; }
          .barWrap { height: 10px; background: #eaeaea; border-radius: 999px; overflow: hidden; margin-top: 8px; }
          .bar { height: 10px; width: ${Math.round((score / 5) * 100)}%; background: ${scoreColor}; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #eee; padding: 8px; font-size: 12px; vertical-align: top; }
          th { text-align: left; font-size: 11px; color: #666; }
          .muted { color: #666; font-size: 12px; }
          .pill { display:inline-block; padding: 3px 8px; border-radius: 999px; font-weight: 700; font-size: 11px; border: 1px solid #eee; }
          .ok { color: #0a7a2a; background: #e9f8ee; border-color: #cfeeda; }
          .no { color: #9c1b1b; background: #fdecec; border-color: #f7cfcf; }
          .sectionTitle { font-weight: 900; margin-top: 10px; }
          .footer { margin-top: 16px; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🔍 FlowOS — AI Planner Audit Report</div>
            <div class="meta">Generated: ${now.toLocaleString()}</div>
          </div>
          <div style="text-align:right;">
            <div class="badge">⭐ ${score.toFixed(2)} / 5</div>
            <div class="meta">Quality: <b>${scoreLabel}</b></div>
          </div>
        </div>

        <div class="card">
          <div class="sectionTitle">⚡ AI Quality Meter</div>
          <div class="barWrap"><div class="bar"></div></div>
          <div class="muted" style="margin-top:6px;">Confidence based on latest plan generation stats.</div>
        </div>

        <div class="card">
          <div class="sectionTitle">📊 Plan Statistics</div>
          <div class="row" style="margin-top:10px;">
            <div class="kpi"><div class="k">Total Plans</div><div class="v">${Number(stats?.totalPlans ?? 0)}</div></div>
            <div class="kpi"><div class="k">Avg Confidence</div><div class="v">${score.toFixed(2)}</div></div>
            <div class="kpi"><div class="k">Avg Coverage</div><div class="v">${Number(stats?.avgCoverage ?? 0).toFixed(0)}%</div></div>
            <div class="kpi"><div class="k">Avg Latency</div><div class="v">${(Number(stats?.avgLatencyMs ?? 0) / 1000).toFixed(1)}s</div></div>
            <div class="kpi"><div class="k">Regeneration Rate</div><div class="v">${Number(stats?.regenerationRate ?? 0).toFixed(0)}%</div></div>
          </div>
        </div>

        <div class="card">
          <div class="sectionTitle">📈 Confidence Trend (Recent)</div>
          ${
            points.length > 1
              ? `
            <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="margin-top:10px; display:block; width:100%; height:auto;">
              <rect x="0" y="0" width="${w}" height="${h}" rx="12" fill="#fafafa" stroke="#eee"></rect>
              <polyline points="${polyline}" fill="none" stroke="${scoreColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
            </svg>
            <div class="muted">Showing confidence values (0–5) and how they change across recent plans.</div>
            `
              : `<div class="muted" style="margin-top:10px;">Not enough data to render a trend chart (need 2+ points).</div>`
          }
        </div>

        <div class="card">
          <div class="sectionTitle">📝 Recent Plans (Top ${Math.min(20, (recent ?? []).length)})</div>
          <table>
            <thead>
              <tr>
                <th>👤 User</th>
                <th>🤖 Model</th>
                <th>⭐ Conf</th>
                <th>📦 Coverage</th>
                <th>⏱ Latency</th>
                <th>🔁 Regen</th>
                <th>🕒 Date</th>
              </tr>
            </thead>
            <tbody>
              ${(recent ?? [])
                .slice(0, 20)
                .map((it: any) => {
                  const regen = !!it?.wasRegenerated;
                  return `
                    <tr>
                      <td>${safe(it?.userId)}</td>
                      <td>${safe(it?.modelUsed)}</td>
                      <td>${Number(it?.avgConfidence ?? 0).toFixed(2)}</td>
                      <td>${Number(it?.coveragePercent ?? 0).toFixed(0)}%</td>
                      <td>${(Number(it?.latencyMs ?? 0) / 1000).toFixed(1)}s</td>
                      <td>
                        <span class="pill ${regen ? "ok" : "no"}">${regen ? "YES" : "NO"}</span>
                      </td>
                      <td>${safe(new Date(it?.requestedAt ?? Date.now()).toLocaleString())}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="footer">
          Generated by FlowOS Mobile • Audit dashboard export
        </div>
      </body>
      </html>
      `;

          // ✅ WEB: open print dialog (user saves as PDF)
          if (Platform.OS === "web") {
            const win = window.open("", "_blank");
            if (!win) {
              Alert.alert("Popup blocked", "Please allow popups to export PDF.");
              return;
            }
            win.document.open();
            win.document.write(html);
            win.document.close();
            win.focus();
            // wait a bit for render then print
            setTimeout(() => win.print(), 400);
            return;
          }

          // ✅ MOBILE: render PDF file and share
          const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
          });

          if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("PDF Saved", `Saved at:\n${uri}`);
            return;
          }

          await Sharing.shareAsync(uri);
        } catch (err) {
          console.error("PDF EXPORT ERROR", err);
          Alert.alert("Export Failed", "Could not export PDF report.");
        }
      };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* 🔹 FIXED HEADER WITH PADDING */}
        <Text
          variant="headlineMedium"
          style={{
            fontWeight: "900",
            marginBottom: 20,
            color: theme.colors.primary,
          }}
        >
          🔍 AI Planner Audit Dashboard
        </Text>

        {/* 📈 EXPORT BUTTONS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Button
            mode="contained"
            icon="file-export"
            onPress={handleExportCsv}
            style={{ borderRadius: 20 }}
          >
            Export CSV
          </Button>

          <Button
            mode="outlined"
            icon="file-pdf-box"
            onPress={handleExportPdf}
            style={{ borderRadius: 20 }}
          >
            PDF Report
          </Button>
        </View>

        {/* 📊 STATISTICS CARD */}
        <Card style={{ borderRadius: 22, padding: 18, marginBottom: 22 }}>
          <Text variant="titleLarge" style={{ fontWeight: "800", marginBottom: 10 }}>
            📊 Plan Statistics
          </Text>

          <Text>
            Total Plans: <AnimatedNumber value={stats.totalPlans} />
          </Text>

          {/* ⭐ AI SCORE BADGE */}
          <Text style={{ marginTop: 6, fontWeight: "600" }}>
            Avg Confidence:
            <Text
              style={{
                backgroundColor: scoreColor,
                color: "white",
                paddingHorizontal: 10,
                paddingVertical: 4,
                marginLeft: 8,
                borderRadius: 12,
                fontWeight: "900",
              }}
            >
              ⭐ {stats.avgConfidence.toFixed(2)}
            </Text>
          </Text>

          <Text>
            Avg Coverage: <AnimatedNumber value={stats.avgCoverage} />%
          </Text>

          <Text>
            Avg Latency: <AnimatedNumber value={stats.avgLatencyMs / 1000} />s
          </Text>

          <Text>
            Regeneration Rate: <AnimatedNumber value={stats.regenerationRate} />%
          </Text>

          {/* 📊 LIVE AI SCORE QUALITY METER */}
          <View style={{ marginTop: 14 }}>
            <Text
              style={{
                fontWeight: "800",
                marginBottom: 6,
                color: theme.colors.onSurface,
              }}
            >
              ⚡ AI Quality: {scoreLabel}
            </Text>

            <View
              style={{
                width: "100%",
                height: 10,
                backgroundColor: "#aaa5",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${(stats.avgConfidence / 5) * 100}%`,
                  height: "100%",
                  backgroundColor: scoreColor,
                }}
              />
            </View>
          </View>
        </Card>

        {/* 📈 CONFIDENCE TREND CHART */}
        <Card
          style={{
            borderRadius: 22,
            paddingVertical: 12,
            paddingHorizontal: 6,
            marginBottom: 22,
          }}
        >
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "800",
              marginLeft: 12,
              marginBottom: 10,
            }}
          >
            📈 Confidence Trend
          </Text>

          {recent.length === 0 ? (
            <Text
              style={{ textAlign: "center", opacity: 0.5, paddingVertical: 20 }}
            >
              No chart data yet 📭
            </Text>
          ) : (
            <LineChart
              data={{
                labels: recent.map((_, i) => `#${i + 1}`),
                datasets: [{ data: recent.map((r) => r.avgConfidence) }],
              }}
              width={screenWidth}
              height={chartHeight}
              bezier
              withVerticalLines={false}
              chartConfig={{
                color: () => theme.colors.primary,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 1,
                labelColor: () => theme.colors.onSurfaceVariant,
                propsForBackgroundLines: {
                  strokeDasharray: "4",
                  stroke: theme.colors.outline,
                },
              }}
              style={{
                borderRadius: 18,
                marginLeft: 12,
                paddingRight: 35,
              }}
            />
          )}
        </Card>

        {/* 📝 EXPANDABLE RECENT ITEMS */}
        <Text variant="titleLarge" style={{ fontWeight: "800", marginBottom: 10 }}>
          📝 Recent Plans
        </Text>

        {recent.map((item, index) => {
          const isOpen = expandedIndex === index;

          return (
            <Pressable
              key={index}
              onPress={() => {
                LayoutAnimation.easeInEaseOut();
                setExpandedIndex(isOpen ? null : index);
              }}
            >
              <Card style={{ borderRadius: 22, padding: 16, marginBottom: 12 }}>
                <Text numberOfLines={1}>👤 {item.userId}</Text>
                <Text>🤖 {item.modelUsed}</Text>

                <Text>
                  ⭐ Confidence:{" "}
                  <Text
                    style={{ fontWeight: "900", color: scoreColor }}
                  >
                    {item.avgConfidence.toFixed(2)}
                  </Text>
                </Text>

                {isOpen && (
                  <>
                    <Divider style={{ marginVertical: 6 }} />
                    <Text>Coverage: {item.coveragePercent}%</Text>
                    <Text>
                      Latency: {(item.latencyMs / 1000).toFixed(1)}s
                    </Text>
                    <Text>
                      Regenerated:{" "}
                      <Text
                        style={{
                          fontWeight: "900",
                          color: item.wasRegenerated ? "#24D45A" : "#E63946",
                        }}
                      >
                        {item.wasRegenerated ? "YES" : "NO"}
                      </Text>
                    </Text>
                    <Text>Date: {new Date(item.requestedAt).toLocaleString()}</Text>
                  </>
                )}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
