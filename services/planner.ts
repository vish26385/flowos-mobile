import { api } from "@/services/api";
import dayjs from "dayjs";

export type GeneratePlanResponse = {
  // keep loose so it works even if your backend returns different shape
  planId?: number | string;
  message?: string;
  dailyPlan?: any;
};

// export async function generateTodayPlan() {
//   // ✅ change this path to your real endpoint
//   // examples: "/planner/generate", "/planner/generate-today", "/dailyplan/generate"
//   const res = await api.post<GeneratePlanResponse>("/plan/generate", {});
//   return res.data;
// }

// export async function generateTodayPlan(planStartLocalIso?: string) {
//   const todayStr = dayjs().format("YYYY-MM-DD");

//   const params: Record<string, string> = { date: todayStr };

//   // Optional: if you want to support user-chosen start time later
//   if (planStartLocalIso) params.planStartLocal = planStartLocalIso;

//   const res = await api.post<GeneratePlanResponse>("/plan/generate", null, { params });
//   return res.data;
// }

export async function generateTodayPlan(date: string, planStartLocal?: string) {
  const params: Record<string, string> = {
    date, // already YYYY-MM-DD from DailyPlan screen
  };

  // optional start time (local IST string like 2026-02-15T23:30:00)
  if (planStartLocal) {
    params.planStartLocal = planStartLocal;
  }

  // IMPORTANT:
  // - null body
  // - params handled by axios
  const res = await api.post<GeneratePlanResponse>("/plan/generate", null, { params });

  return res.data;
}
