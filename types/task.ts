export type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // ISO string (from backend)
  priority: number; // 1=Low, 2=Medium, 3=High
  completed: boolean;
};

export type CreateTaskRequest = Omit<Task, "id">;
export type UpdateTaskRequest = Partial<Task>;
