import { http } from "./http";

export type Category = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export async function listCategories() {  
  const res = await http.get<Paginated<Category> | Category[]>("/api/categories/");
  return res.data;
}

export async function createCategory(payload: { name: string }) {
  const res = await http.post<Category>("/api/categories/", payload);
  return res.data;
}