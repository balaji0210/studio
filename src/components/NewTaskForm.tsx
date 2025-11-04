"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Bell,
  Calendar as CalendarIcon,
  Plus,
  Loader2
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createTask } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  priority: z.enum(["low", "medium", "high"]),
  reminder: z.boolean().default(false),
});

type NewTaskFormProps = {
  onTaskCreate: (task: Task) => void;
};

export function NewTaskForm({ onTaskCreate }: NewTaskFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      reminder: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const newTask = await createTask(values);
      onTaskCreate(newTask);
      toast({
        title: "Task Created",
        description: `"${newTask.title}" has been added to your list.`,
      });
      if (newTask.intelligentNotification) {
        toast({
            title: "Intelligent Reminder Set",
            description: `We'll remind you at the optimal time!`,
            action: (
              <div className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                <span>
                  {format(new Date(newTask.intelligentNotification.time), "MMM d, p")}
                </span>
              </div>
            ),
        });
      }
      setOpen(false);
      form.reset({ title: "", description: "", priority: "medium", reminder: false });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task. Please try again.",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none flex flex-col gap-0">
        <SheetHeader className="p-6">
          <SheetTitle>Create a New Task</SheetTitle>
          <SheetDescription>
            Fill in the details below to add a new task to your list.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6 pb-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Finalize project report" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add more details about your task..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low" />
                          </FormControl>
                          <FormLabel className="font-normal">Low</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high" />
                          </FormControl>
                          <FormLabel className="font-normal">High</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reminder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">AI Reminder</FormLabel>
                      <FormDescription>
                        Enable an intelligent reminder for this task.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter className="p-6 pt-0 mt-auto">
            <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Task"}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
