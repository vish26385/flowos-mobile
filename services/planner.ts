import { api } from "@/services/api";

export type GeneratePlanResponse = {
  // keep loose so it works even if your backend returns different shape
  planId?: number | string;
  message?: string;
  dailyPlan?: any;
};

export async function generateTodayPlan() {
  // ✅ change this path to your real endpoint
  // examples: "/planner/generate", "/planner/generate-today", "/dailyplan/generate"
  const res = await api.post<GeneratePlanResponse>("/plan/generate", {});
  return res.data;
}
