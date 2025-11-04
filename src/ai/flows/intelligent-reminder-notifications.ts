'use server';

/**
 * @fileOverview A flow for sending intelligent task reminders based on user behavior and task urgency.
 *
 * - intelligentReminderNotification - A function that sends task reminders with dynamically adjusted notification times.
 * - IntelligentReminderInput - The input type for the intelligentReminderNotification function.
 * - IntelligentReminderOutput - The return type for the intelligentReminderNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentReminderInputSchema = z.object({
  taskId: z.string().describe('The unique identifier for the task.'),
  userId: z.string().describe('The unique identifier for the user.'),
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  dueDate: z.string().describe('The due date and time of the task in ISO format.'),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority level of the task.'),
  userPastCompletionRate: z
    .number()
    .min(0)
    .max(1)
    .describe('The user past task completion rate (0 to 1).'),
});
export type IntelligentReminderInput = z.infer<typeof IntelligentReminderInputSchema>;

const IntelligentReminderOutputSchema = z.object({
  notificationTime: z
    .string()
    .describe(
      'The calculated notification time in ISO format, adjusted based on user behavior and task urgency.'
    ),
  message: z.string().describe('The reminder message to be sent to the user.'),
});
export type IntelligentReminderOutput = z.infer<typeof IntelligentReminderOutputSchema>;

export async function intelligentReminderNotification(
  input: IntelligentReminderInput
): Promise<IntelligentReminderOutput> {
  return intelligentReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentReminderPrompt',
  input: {schema: z.object({
    ...IntelligentReminderInputSchema.shape,
    now: z.string().describe("The current date and time in ISO format.")
  })},
  output: {schema: IntelligentReminderOutputSchema},
  prompt: `You are an AI assistant designed to schedule task reminders for users. You will receive task details and user behavior data, and your goal is to determine the optimal notification time to maximize the likelihood of task completion.

Task Details:
- Task ID: {{{taskId}}}
- User ID: {{{userId}}}
- Title: {{{taskTitle}}}
- Description: {{{taskDescription}}}
- Due Date: {{{dueDate}}}
- Priority: {{{priority}}}

User Behavior:
- Past Completion Rate: {{{userPastCompletionRate}}}

Instructions:
1. Analyze the task details and user behavior data.
2. Based on the priority of the task and the user's past completion rate, determine the ideal time to send the reminder. High-priority tasks for users with low completion rates should be reminded earlier.
3. The notification time must be before the due date.
4. The current date is {{now}}.

Output:
Return the notification time in ISO format and a concise reminder message containing the task title and due date.`,
});

const intelligentReminderFlow = ai.defineFlow(
  {
    name: 'intelligentReminderFlow',
    inputSchema: IntelligentReminderInputSchema,
    outputSchema: IntelligentReminderOutputSchema,
  },
  async input => {
    const now = new Date().toISOString();
    const {output} = await prompt({...input, now});
    return output!;
  }
);
