'use server';

/**
 * @fileOverview Summarizes the user's task history over a given period.
 *
 * - summarizeTaskHistory - A function that summarizes the task history.
 * - SummarizeTaskHistoryInput - The input type for the summarizeTaskHistory function.
 * - SummarizeTaskHistoryOutput - The return type for the summarizeTaskHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTaskHistoryInputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      dueDate: z.string(),
      priority: z.string(),
      completed: z.boolean(),
    })
  ).describe('Array of completed tasks with title, description, due date, priority and completion status.'),
  period: z.string().describe('The period for which to summarize the tasks (e.g., weekly, monthly).'),
});
export type SummarizeTaskHistoryInput = z.infer<typeof SummarizeTaskHistoryInputSchema>;

const SummarizeTaskHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the completed tasks, including key insights and patterns.'),
});
export type SummarizeTaskHistoryOutput = z.infer<typeof SummarizeTaskHistoryOutputSchema>;

export async function summarizeTaskHistory(input: SummarizeTaskHistoryInput): Promise<SummarizeTaskHistoryOutput> {
  return summarizeTaskHistoryFlow(input);
}

const summarizeTaskHistoryPrompt = ai.definePrompt({
  name: 'summarizeTaskHistoryPrompt',
  input: {schema: SummarizeTaskHistoryInputSchema},
  output: {schema: SummarizeTaskHistoryOutputSchema},
  prompt: `You are an AI assistant that analyzes completed tasks and provides a summary of productivity and patterns.

  Summarize the following completed tasks for the given period, highlighting key insights and patterns in task completion habits.

  Period: {{{period}}}

  Completed Tasks:
  {{#each tasks}}
  - Title: {{{title}}}, Description: {{{description}}}, Due Date: {{{dueDate}}}, Priority: {{{priority}}}
  {{/each}}
  `,
});

const summarizeTaskHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeTaskHistoryFlow',
    inputSchema: SummarizeTaskHistoryInputSchema,
    outputSchema: SummarizeTaskHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizeTaskHistoryPrompt(input);
    return output!;
  }
);
