export type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // ISO string (from backend)
  // ✅ NEW: user-decided schedule times (UTC ISO strings) - optional
  plannedStartUtc?: string | null;
  plannedEndUtc?: string | null;
  priority: number; // 1=Low, 2=Medium, 3=High
  completed: boolean;
};

export type CreateTaskRequest = Omit<Task, "id">;
export type UpdateTaskRequest = Partial<Task>;
