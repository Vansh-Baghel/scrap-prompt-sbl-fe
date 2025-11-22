export type TaskType = {
    id: string;
    url: string;
    question: string;
    status: "pending" | "completed" | "failed";
    answer?: string;
    createdAt: Date;
};