import { http } from "./http";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  category: number | null;
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type TaskListParams = {
  page?: number;
  completed?: "true" | "false";
  search?: string;
  ordering?: string;
};

export async function listTasks(params: TaskListParams) {
  const res = await http.get<Paginated<Task>>("/api/tasks/", { params });
  return res.data;
}

export async function createTask(payload: { title: string; description?: string; category?: number | null }) {
  const res = await http.post<Task>("/api/tasks/", {
    title: payload.title,
    description: payload.description ?? "",
    category: payload.category ?? null,
    completed: false,
  });
  return res.data;
}

export async function updateTask(id: number, patch: Partial<Pick<Task, "title" | "description" | "completed" | "category">>) {
  const res = await http.patch<Task>(`/api/tasks/${id}/`, patch);
  return res.data;
}