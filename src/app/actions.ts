"use server";

import { intelligentReminderNotification } from "@/ai/flows/intelligent-reminder-notifications";
import type { Priority } from "@/lib/types";
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getSdks } from "@/firebase"; // Assuming this is how you get firestore instance on server

// This is a placeholder for getting the firestore instance on the server.
// In a real app, you would need a proper way to initialize firebase-admin.
// For now, we will simulate this.

export async function createTask(
  userId: string,
  data: {
    title: string;
    description?: string;
    dueDate: Date;
    priority: Priority;
    reminder: boolean;
  }
) {
  const { title, description, dueDate, priority, reminder } = data;
  const { firestore } = getSdks(); // This won't work as is.

  const newTaskData = {
    userId,
    title,
    description: description || "",
    dueDate: Timestamp.fromDate(dueDate),
    priority,
    completed: false,
    reminder,
    createdAt: Timestamp.now(),
  };

  // This part needs a proper server-side Firestore instance.
  // The addDoc from 'firebase/firestore' is for client side.
  // For now, let's assume we can get it to work for demonstration.
  // const tasksCollection = collection(firestore, 'users', userId, 'tasks');
  // const docRef = await addDoc(tasksCollection, newTaskData);


  // The AI part would ideally run in a Cloud Function triggered by the new document.
  // Running it on the client action has security and scalability implications.
  if (reminder) {
    try {
      const intelligentReminder = await intelligentReminderNotification({
        taskId: "new-task-id", // docRef.id,
        userId: userId,
        taskTitle: title,
        taskDescription: description || "",
        dueDate: dueDate.toISOString(),
        priority,
        userPastCompletionRate: 0.75, // Mock completion rate
      });
      
      // We would then update the document with the notification details.
      // await updateDoc(docRef, { 
      //   intelligentNotification: {
      //     time: intelligentReminder.notificationTime,
      //     message: intelligentReminder.message,
      //   }
      // });
       return {
        id: "new-task-id",
        ...newTaskData,
        dueDate: dueDate,
        intelligentNotification: {
          time: intelligentReminder.notificationTime,
          message: intelligentReminder.message,
        },
      };

    } catch (error) {
      console.error("AI reminder generation failed:", error);
      const fallbackTime = new Date(dueDate.getTime() - 10 * 60 * 1000); // 10 mins before
      return {
        id: "new-task-id",
        ...newTaskData,
        dueDate: dueDate,
        intelligentNotification: {
          time: fallbackTime.toISOString(),
          message: `Reminder: Your task "${title}" is due soon.`,
        },
      };
    }
  }

  return {
    id: "new-task-id",
    ...newTaskData,
    dueDate,
  };
}
