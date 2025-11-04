export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  completedAt?: Date;
  reminder?: boolean;
  intelligentNotification?: {
    time: string;
    message: string;
  };
};
