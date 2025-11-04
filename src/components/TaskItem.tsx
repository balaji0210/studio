"use client";

import { motion } from "framer-motion";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { Bell, Flame, Snowflake, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Task, Priority } from "@/lib/types";

type TaskItemProps = {
  task: Task;
  onToggleComplete: (id: string) => void;
};

const priorityMap: Record<Priority, { label: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, className: string }> = {
    high: { label: 'High', icon: Flame, className: 'bg-red-500/90 text-red-50 border-red-600/50' },
    medium: { label: 'Medium', icon: Zap, className: 'bg-yellow-500/90 text-yellow-50 border-yellow-600/50' },
    low: { label: 'Low', icon: Snowflake, className: 'bg-blue-500/90 text-blue-50 border-blue-600/50' },
};

export function TaskItem({ task, onToggleComplete }: TaskItemProps) {
    const priority = priorityMap[task.priority];
    const isOverdue = !task.completed && new Date() > task.dueDate;

    const formattedDueDate = isToday(task.dueDate)
        ? `Today at ${format(task.dueDate, 'p')}`
        : format(task.dueDate, "MMMM d, yyyy");

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <Card className={cn(
                "transition-all duration-300 hover:shadow-md",
                task.completed ? "bg-card/60" : "bg-card",
                isOverdue && "border-destructive/50 shadow-lg shadow-destructive/10"
            )}>
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className={cn("text-lg", task.completed && "line-through text-muted-foreground")}>
                            {task.title}
                        </CardTitle>
                        <Badge variant="outline" className={cn("shrink-0", priority.className)}>
                            <priority.icon className="mr-1 h-3 w-3" />
                            {priority.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                    <div className="flex items-start gap-4">
                        <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={() => onToggleComplete(task.id)}
                            aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                            className="mt-1 h-5 w-5 rounded-[4px]"
                        />
                        {task.description && <p className={cn("text-sm text-muted-foreground", task.completed && "line-through")}>{task.description}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                     <div className={cn("font-medium", isOverdue ? "text-destructive" : "")}>
                        {formattedDueDate} ({formatDistanceToNow(task.dueDate, { addSuffix: true })})
                    </div>
                    {task.intelligentNotification && !task.completed && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 text-primary cursor-default">
                                        <Bell className="h-4 w-4" />
                                        <span>AI Reminder</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{task.intelligentNotification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Scheduled for: {format(new Date(task.intelligentNotification.time), "MMM d, p")}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
