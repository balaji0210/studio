"use client";

import { AnimatePresence } from "framer-motion";
import type { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
};

export function TaskList({ tasks, onToggleComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
