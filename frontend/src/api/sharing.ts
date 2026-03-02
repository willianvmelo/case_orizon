import { http } from "./http";

export type SharePayload = {
  emails: string[];
};

export type ShareResult = {
  shared_added?: number;
  shared_removed?: number;
  shared_with_emails?: string[];
};

export async function shareTask(taskId: number, payload: SharePayload) {
  const res = await http.post<ShareResult>(`/api/tasks/${taskId}/share/`, payload);
  return res.data;
}

export async function unshareTask(taskId: number, payload: SharePayload) {
  const res = await http.post<ShareResult>(`/api/tasks/${taskId}/unshare/`, payload);
  return res.data;
}