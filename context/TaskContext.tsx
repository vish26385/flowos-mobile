// import React, { useRef, createContext, useContext, useEffect, useMemo } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/services/api";
// import { Task, CreateTaskRequest, UpdateTaskRequest } from "@/types/task";
// import { useAuth } from "@/context/AuthContext"; // ✅ watch token state
// import { useOfflineSync } from "@/hooks/useOfflineSync";

// type TaskContextState = {
//   tasks: Task[] | undefined;
//   isLoading: boolean;
//   isAdding: boolean;
//   isUpdating: boolean;
//   isDeleting: boolean;
//   refetch: () => void;
//   addTask: (task: CreateTaskRequest) => Promise<void>;
//   updateTask: (id: number, task: UpdateTaskRequest) => Promise<void>;
//   deleteTask: (id: number) => Promise<void>;
//   getTaskById: (id: number) => Promise<Task | null>;   // ✅ NEW
// };

// const TaskContext = createContext<TaskContextState | undefined>(undefined);

// export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   useOfflineSync(); // ✅ monitor network status globally

//   const { token, loading  } = useAuth(); // ✅ get token from AuthContext
//   const qc = useQueryClient();

//   const prevToken = useRef<string | null>(null);

//   // 🧹 Clear cached tasks immediately when user logs out
//   useEffect(() => {

//     if (loading) return; // wait for auth hydration

//     const wasLoggedIn = !!prevToken.current;
//     const isLoggedIn = !!token;

//     //if (!token) {
//     if (wasLoggedIn && !isLoggedIn) {
//       console.log("🧹 User logged out — clearing cached tasks...");
//       //qc.removeQueries({ queryKey: ["tasks"] }); // ✅ remove cached list
//       qc.removeQueries({ queryKey: ["tasks"], exact: false }); // ✅ remove cached list
//     }

//     prevToken.current = token ?? null;
//   }, [token, loading, qc]);

//   // ✅ Fetch tasks — only when token exists
//   const {
//     data: tasks,
//     isLoading,
//     refetch,
//   } = useQuery<Task[]>({
//     queryKey: ["tasks"],
//     queryFn: async () => (await api.get<Task[]>("/tasks")).data,
//     enabled: !!token,
//     staleTime: 0,
//     refetchOnMount: true,
//     refetchOnReconnect: true,
//   });

//   // 🔁 Auto-refetch once token becomes available
//   useEffect(() => {
//     if (token) {
//       console.log("🔁 Token available — fetching tasks...");
//       refetch();
//     }
//   }, [token]);

//   // ✅ Add Task
//   const addMutation = useMutation({
//     mutationFn: async (task: CreateTaskRequest) => {
//       await api.post<Task>("/tasks", task);
//     },
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
//   });

//   // ✅ Update Task
//   const updateMutation = useMutation({
//     mutationFn: async ({ id, task }: { id: number; task: UpdateTaskRequest }) => {
//       await api.put<Task>(`/tasks/${id}`, task);
//     },
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
//   });

//   // ✅ Delete Task
//   const deleteMutation = useMutation({
//     mutationFn: async (id: number) => {
//       await api.delete(`/tasks/${id}`);
//     },
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
//   });

//   // ✅ Get single task (from cache or fetch if missing)
//   const getTaskById = async (id: number): Promise<Task | null> => {
//     // 1️⃣ Try to find in memory first
//     const found = tasks?.find((t) => t.id === id);
//     if (found) return found;

//     // 2️⃣ Otherwise, fetch from API once
//     try {
//       console.log(`🌐 Fetching single task /tasks/${id} (not in cache)`);
//       const res = await api.get<Task>(`/tasks/${id}`);
//       return res.data;
//     } catch (err) {
//       console.warn(`❌ Task ${id} not found on server`);
//       return null;
//     }
//   };

//   // ✅ Consolidated context value
//   const value = useMemo<TaskContextState>(
//     () => ({
//       tasks,
//       isLoading,
//       isAdding: addMutation.isPending,
//       isUpdating: updateMutation.isPending,
//       isDeleting: deleteMutation.isPending,
//       refetch,
//       addTask: async (task) => addMutation.mutateAsync(task),
//       updateTask: async (id, task) => updateMutation.mutateAsync({ id, task }),
//       deleteTask: async (id) => deleteMutation.mutateAsync(id),
//       getTaskById, // ✅ include here
//     }),
//     [
//       tasks,
//       isLoading,
//       addMutation.isPending,
//       updateMutation.isPending,
//       deleteMutation.isPending,
//     ]
//   );

//   return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
// };

// // ✅ Hook for global access
// export const useTasks = () => {
//   const ctx = useContext(TaskContext);
//   if (!ctx) throw new Error("useTasks must be used within TaskProvider");
//   return ctx;
// };

import React, { useRef, createContext, useContext, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { api } from "@/services/api";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "@/types/task";
import { useAuth } from "@/context/AuthContext"; // ✅ watch token state
import { useOfflineSync } from "@/hooks/useOfflineSync";

type TaskContextState = {
  tasks: Task[] | undefined;
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  refetch: () => void;
  addTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: number, task: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTaskById: (id: number) => Promise<Task | null>; // ✅ NEW
};

const TaskContext = createContext<TaskContextState | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useOfflineSync(); // ✅ monitor network status globally

  const { token, loading } = useAuth(); // ✅ get token from AuthContext
  const qc = useQueryClient();

  const prevToken = useRef<string | null>(null);

  // 🧹 Clear cached tasks immediately when user logs out
  useEffect(() => {
    if (loading) return; // wait for auth hydration

    const wasLoggedIn = !!prevToken.current;
    const isLoggedIn = !!token;

    if (wasLoggedIn && !isLoggedIn) {
      console.log("🧹 User logged out — clearing cached tasks...");
      qc.removeQueries({ queryKey: ["tasks"], exact: false });
      qc.removeQueries({ queryKey: ["plan"], exact: false }); // ✅ also clear any cached plans
    }

    prevToken.current = token ?? null;
  }, [token, loading, qc]);

  // ✅ Fetch tasks — only when token exists
  const {
    data: tasks,
    isLoading,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => (await api.get<Task[]>("/tasks")).data,
    enabled: !!token,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // 🔁 Auto-refetch once token becomes available
  useEffect(() => {
    if (token) {
      console.log("🔁 Token available — fetching tasks...");
      refetch();
    }
  }, [token, refetch]);

  // ✅ Add Task
  const addMutation = useMutation({
    mutationFn: async (task: CreateTaskRequest) => {
      await api.post<Task>("/tasks", task);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"], exact: false });
    },
  });

  // ✅ Update Task
  const updateMutation = useMutation({
    mutationFn: async ({ id, task }: { id: number; task: UpdateTaskRequest }) => {
      await api.put<Task>(`/tasks/${id}`, task);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"], exact: false });
    },
  });

// ✅ Delete Task  (FIX: return void, use "variables" for deletedId)
const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
    await api.delete(`/tasks/${id}`);
    // ✅ DO NOT return id
  },

  // onSuccess(data, variables) => variables is the id you passed
  onSuccess: async (_data, deletedId) => {
    // 1) Invalidate the global list (your context list)
    qc.invalidateQueries({ queryKey: ["tasks"], exact: false });

    // 2) Find deleted task's dueDate from cached list (so we know which day plan belongs to)
    const cachedTasks = (qc.getQueryData<Task[]>(["tasks"]) ?? tasks) || [];
    const deletedTask = cachedTasks.find((t) => t.id === deletedId);

    // If we can't find it, fall back to invalidating all plan caches
    if (!deletedTask?.dueDate) {
      qc.invalidateQueries({ queryKey: ["plan"], exact: false });
      return;
    }

    const planDateStr = dayjs(deletedTask.dueDate)
      .startOf("day")
      .format("YYYY-MM-DD");

    const tasksTodayKey = ["tasks", "today", planDateStr] as const;
    const planTodayKey = ["plan", "today", planDateStr] as const;

    // 3) Immediately hide plan UI for that day
    qc.setQueryData(planTodayKey, null);

    // 4) Force DailyPlan queries to refetch next time
    await Promise.all([
      qc.invalidateQueries({ queryKey: tasksTodayKey }),
      qc.invalidateQueries({ queryKey: planTodayKey }),
    ]);
  },
});

  // ✅ Get single task (from cache or fetch if missing)
  const getTaskById = async (id: number): Promise<Task | null> => {
    // 1️⃣ Try to find in memory first
    const found = tasks?.find((t) => t.id === id);
    if (found) return found;

    // 2️⃣ Otherwise, fetch from API once
    try {
      console.log(`🌐 Fetching single task /tasks/${id} (not in cache)`);
      const res = await api.get<Task>(`/tasks/${id}`);
      return res.data;
    } catch (err) {
      console.warn(`❌ Task ${id} not found on server`);
      return null;
    }
  };

  // ✅ Consolidated context value
  const value = useMemo<TaskContextState>(
    () => ({
      tasks,
      isLoading,
      isAdding: addMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      refetch,
      addTask: async (task) => addMutation.mutateAsync(task),
      updateTask: async (id, task) => updateMutation.mutateAsync({ id, task }),
      deleteTask: async (id) => deleteMutation.mutateAsync(id),
      getTaskById,
    }),
    [
      tasks,
      isLoading,
      addMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      refetch,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// ✅ Hook for global access
export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};