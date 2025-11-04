import type { Timestamp } from 'firebase/firestore';

export type Priority = "low" | "medium" | "high";

export type BaseTask = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  reminder?: boolean;
  intelligentNotification?: {
    time: string;
    message: string;
  };
};

export type Task = BaseTask & {
  dueDate: Date;
  completedAt?: Date;
};

export type FirestoreTask = BaseTask & {
  dueDate: Timestamp;
  completedAt?: Timestamp;
};
