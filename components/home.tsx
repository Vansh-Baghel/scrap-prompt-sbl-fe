"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, getAllTasks } from "@/utils/apis";
import { subscribeToTask } from "@/utils/subscribe";
import { TaskType } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function HomeComponent() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createTask,
    onSuccess: (task: TaskType) => {
      toast.success("Task created!");

      // 1. Immediately add to query cache so it shows instantly
      queryClient.setQueryData(["tasks"], (old: TaskType[] | undefined) => {
        if (!old) return [task];
        return [task, ...old];
      });

      // 2. Start listening for updates (SSE live updates)
      subscribeToTask(task.id, queryClient);

      setUrl("");
      setPrompt("");
    },
    onError: () => {
      toast.error("Failed creating task");
    },
  });

  // Submit form handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ url, question: prompt });
  };

  return (
    <div className="max-w-lg mx-auto py-8 space-y-4">
      {/* Form */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Website URL"
        />
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Your question..."
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>

      <div className="p-3 border rounded-md space-y-2">
        <h3 className="font-semibold text-lg">Task History (Live)</h3>

        {!tasks?.length && (
          <p className="text-gray-500 text-sm">No tasks yet.</p>
        )}

        {tasks?.map((t: TaskType) => (
          <div
            key={t.id}
            className="border rounded-md p-2 text-sm bg-white shadow-sm"
          >
            <p>
              <strong>URL:</strong> {t.url}
            </p>
            <p>
              <strong>Q:</strong> {t.question}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  t.status === "completed"
                    ? "text-green-600 font-medium"
                    : t.status === "failed"
                    ? "text-red-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {t.status}
              </span>
            </p>

            {t.answer && (
              <p className="text-green-700 mt-1">
                <strong>Answer:</strong> {t.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
