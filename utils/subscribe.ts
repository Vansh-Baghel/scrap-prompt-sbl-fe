import { API_URL } from "@/utils/config";
import { TaskType } from "@/utils/types";
import { QueryClient } from "@tanstack/react-query";

export function subscribeToTask(taskId: string, queryClient: QueryClient) {
  const eventSource = new EventSource(`${API_URL}/tasks/stream/${taskId}`);

  eventSource.onmessage = (event) => {
    const updatedTask: TaskType = JSON.parse(event.data);

    queryClient.setQueryData(["tasks"], (old: TaskType[] | undefined) => {
      if (!old) return [updatedTask];

      // Replace the matching task
      const next = old.map((t) => (t.id === updatedTask.id ? updatedTask : t));

      // Sort: newest first
      return next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  eventSource.onerror = () => eventSource.close();
}
