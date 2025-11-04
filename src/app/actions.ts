"use server";

import { intelligentReminderNotification } from "@/ai/flows/intelligent-reminder-notifications";
import type { Task, Priority } from "@/lib/types";

export async function createTask(data: {
  title: string;
  description?: string;
  dueDate: Date;
  priority: Priority;
  reminder: boolean;
}): Promise<Task> {
  const { title, description, dueDate, priority, reminder } = data;

  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    description,
    dueDate,
    priority,
    completed: false,
    reminder,
  };

  if (reminder) {
    try {
      const intelligentReminder = await intelligentReminderNotification({
        taskId: newTask.id,
        userId: "user-123", // Mock user ID
        taskTitle: title,
        taskDescription: description || "",
        dueDate: dueDate.toISOString(),
        priority,
        userPastCompletionRate: 0.75, // Mock completion rate
      });
      newTask.intelligentNotification = {
        time: intelligentReminder.notificationTime,
        message: intelligentReminder.message,
      };
    } catch (error) {
      console.error("AI reminder generation failed:", error);
      // Fallback in case AI call fails.
      const fallbackTime = new Date(dueDate.getTime() - 10 * 60 * 1000); // 10 mins before
      newTask.intelligentNotification = {
          time: fallbackTime.toISOString(),
          message: `Reminder: Your task "${title}" is due soon.`,
      };
    }
  }

  return newTask;
}
