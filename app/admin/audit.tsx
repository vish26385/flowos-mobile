// import React, { useState } from "react";
// import {
//   ScrollView,
//   Pressable,
//   LayoutAnimation,
//   Dimensions,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   Text,
//   Card,
//   ActivityIndicator,
//   useTheme,
//   Divider,
// } from "react-native-paper";
// import { LineChart } from "react-native-chart-kit";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/services/api";
// import { useAuth } from "@/context/AuthContext";

// const screenWidth = Dimensions.get("window").width - 60;

// /** 🌈 Animated Count Component */
// const AnimatedNumber = ({ value }: { value: number }) => {
//   const [display, setDisplay] = useState(0);

//   React.useEffect(() => {
//     let frame = 0;
//     const totalFrames = 18;
//     const step = value / totalFrames;

//     const timer = setInterval(() => {
//       frame++;
//       setDisplay(Number((step * frame).toFixed(2)));
//       if (frame >= totalFrames) clearInterval(timer);
//     }, 30);

//     return () => clearInterval(timer);
//   }, []);

//   return <Text>{display}</Text>;
// };

// export default function AuditDashboard() {
//   const { token, loading } = useAuth();
//   const theme = useTheme();
//   const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

//   if (loading || !token) return <ActivityIndicator style={{ marginTop: 40 }} />;

//   /** 🧠 Stats */
//   const statsQuery = useQuery({
//     queryKey: ["audit", "stats"],
//     queryFn: async () => (await api.get("/audit/stats")).data,
//   });

//   /** 🧠 Last 20 plan logs */
//   const recentQuery = useQuery({
//     queryKey: ["audit", "recent"],
//     queryFn: async () => (await api.get("/audit/recent")).data,
//   });

//   if (statsQuery.isLoading || recentQuery.isLoading)
//     return <ActivityIndicator style={{ marginTop: 40 }} />;

//   const stats = statsQuery.data;
//   const recent: any[] = recentQuery.data ?? [];

//   const chartHeight = recent.length <= 1 ? 120 : 220;

//   /** ⭐ SCORE BADGE COLOR LOGIC */
//   const scoreColor =
//     stats.avgConfidence >= 4.5
//       ? "#24D45A" // green
//       : stats.avgConfidence >= 3.5
//       ? "#FFB300" // yellow
//       : "#E63946"; // red

//   /** 📊 SCORE QUALITY LABEL */
//   const scoreLabel =
//     stats.avgConfidence >= 4.5
//       ? "EXCELLENT"
//       : stats.avgConfidence >= 3.5
//       ? "GOOD"
//       : "NEEDS IMPROVEMENT";

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
//       <ScrollView
//         contentContainerStyle={{
//           padding: 16,
//           paddingBottom: 100,
//         }}
//       >
//         {/* 🔹 FIXED HEADER */}
//         <Text
//           variant="headlineMedium"
//           style={{
//             fontWeight: "900",
//             marginBottom: 20,
//             color: theme.colors.primary,
//           }}
//         >
//           🔍 AI Planner Audit Dashboard
//         </Text>

//         {/* 📈 STATS CARD */}
//         <Card style={{ borderRadius: 22, padding: 18, marginBottom: 22 }}>
//           <Text variant="titleLarge" style={{ fontWeight: "800", marginBottom: 10 }}>
//             📊 Plan Statistics
//           </Text>

//           <Text>
//             Total Plans: <AnimatedNumber value={stats.totalPlans} />
//           </Text>

//           {/* ⭐ AI SCORE BADGE */}
//           <Text style={{ marginTop: 4, fontWeight: "600" }}>
//             Avg Confidence:
//             <Text
//               style={{
//                 backgroundColor: scoreColor,
//                 paddingVertical: 4,
//                 paddingHorizontal: 12,
//                 borderRadius: 14,
//                 marginLeft: 8,
//                 overflow: "hidden",
//                 color: "white",
//                 fontWeight: "900",
//               }}
//             >
//               ⭐ {stats.avgConfidence.toFixed(2)}
//             </Text>
//           </Text>

//           <Text>
//             Avg Coverage: <AnimatedNumber value={stats.avgCoverage} />%
//           </Text>

//           <Text>
//             Avg Latency:{" "}
//             <AnimatedNumber value={stats.avgLatencyMs / 1000} />s
//           </Text>

//           <Text>
//             Regeneration Rate:{" "}
//             <AnimatedNumber value={stats.regenerationRate} />%
//           </Text>

//           {/* 📊 LIVE AI SCORE METER */}
//           <View style={{ marginTop: 14 }}>
//             <Text
//               style={{
//                 fontWeight: "800",
//                 marginBottom: 6,
//                 color: theme.colors.primary,
//               }}
//             >
//               ⚡ AI Quality: {scoreLabel}
//             </Text>

//             <View
//               style={{
//                 width: "100%",
//                 height: 10,
//                 backgroundColor: "#9994",
//                 borderRadius: 10,
//                 overflow: "hidden",
//               }}
//             >
//               <View
//                 style={{
//                   width: `${(stats.avgConfidence / 5) * 100}%`,
//                   height: "100%",
//                   backgroundColor: scoreColor,
//                 }}
//               />
//             </View>
//           </View>
//         </Card>

//         {/* 📉 LINE CHART */}
//         <Card
//           style={{
//             borderRadius: 22,
//             paddingVertical: 12,
//             paddingHorizontal: 6,
//             marginBottom: 20,
//           }}
//         >
//           <Text
//             variant="titleLarge"
//             style={{
//               fontWeight: "800",
//               marginLeft: 12,
//               marginBottom: 10,
//             }}
//           >
//             📈 Confidence Trend
//           </Text>

//           {recent.length === 0 ? (
//             <Text
//               style={{ textAlign: "center", opacity: 0.5, paddingVertical: 20 }}
//             >
//               No chart data yet 📭
//             </Text>
//           ) : (
//             <LineChart
//               data={{
//                 labels: recent.map((_, i) => `#${i + 1}`),
//                 datasets: [{ data: recent.map((r) => r.avgConfidence) }],
//               }}
//               width={screenWidth}
//               height={chartHeight}
//               bezier
//               withVerticalLines={false}
//               chartConfig={{
//                 color: () => theme.colors.primary,
//                 backgroundGradientFrom: theme.colors.surface,
//                 backgroundGradientTo: theme.colors.surface,
//                 decimalPlaces: 1,
//                 labelColor: () => theme.colors.onSurfaceVariant,
//                 propsForBackgroundLines: {
//                   strokeDasharray: "4",
//                   stroke: theme.colors.outline,
//                 },
//               }}
//               style={{
//                 borderRadius: 18,
//                 marginLeft: 12,
//                 paddingRight: 35,
//               }}
//             />
//           )}
//         </Card>

//         {/* 📝 RECENT PLANS */}
//         <Text variant="titleLarge" style={{ fontWeight: "800", marginBottom: 10 }}>
//           📝 Recent Plans
//         </Text>

//         {recent.length === 0 && (
//           <Text style={{ opacity: 0.5, textAlign: "center" }}>
//             No history yet 😴
//           </Text>
//         )}

//         {recent.map((item, index) => {
//           const isOpen = expandedIndex === index;

//           return (
//             <Pressable
//               key={index}
//               onPress={() => {
//                 LayoutAnimation.easeInEaseOut();
//                 setExpandedIndex(isOpen ? null : index);
//               }}
//             >
//               <Card style={{ borderRadius: 22, padding: 16, marginBottom: 12 }}>
//                 <Text numberOfLines={1}>👤 {item.userId}</Text>
//                 <Text>🤖 {item.modelUsed}</Text>

//                 <Text>
//                   ⭐ Confidence:{" "}
//                   <Text style={{ fontWeight: "900", color: scoreColor }}>
//                     {item.avgConfidence}
//                   </Text>
//                 </Text>

//                 {isOpen && (
//                   <>
//                     <Divider style={{ marginVertical: 6 }} />
//                     <Text>Coverage: {item.coveragePercent}%</Text>
//                     <Text>
//                       Latency: {(item.latencyMs / 1000).toFixed(1)}s
//                     </Text>
//                     <Text>
//                       Regenerated:{" "}
//                       <Text
//                         style={{
//                           fontWeight: "900",
//                           color: item.wasRegenerated ? "#24D45A" : "#E63946",
//                         }}
//                       >
//                         {item.wasRegenerated ? "YES" : "NO"}
//                       </Text>
//                     </Text>
//                     <Text>Date: {new Date(item.requestedAt).toLocaleString()}</Text>
//                   </>
//                 )}
//               </Card>
//             </Pressable>
//           );
//         })}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

import React, { useState } from "react";
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

  /** 📄 EXPORT PDF */
  const handleExportPdf = () => {
    Alert.alert("PDF Export", "Coming soon! (Can be added on request)");
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
