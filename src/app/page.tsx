"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { NewTaskForm } from '@/components/NewTaskForm';
import { TaskList } from '@/components/TaskList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import type { Task, Priority } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

type SortOption = 'dueDate' | 'priority';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('dueDate');

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const priorityOrder: Record<Priority, number> = { high: 1, medium: 2, low: 3 };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (sortOption === 'dueDate') {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (sortOption === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  }, [tasks, sortOption]);

  const pendingTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);
  
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const overdueTasks = pendingTasks.filter(task => new Date(task.dueDate) < todayStart && !task.completed);
  const todayTasks = pendingTasks.filter(task => task.dueDate.toDateString() === new Date().toDateString() && !task.completed);
  const upcomingTasks = pendingTasks.filter(task => new Date(task.dueDate) > todayStart && task.dueDate.toDateString() !== new Date().toDateString() && !task.completed);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Tasks</h2>
            <p className="text-muted-foreground">Stay organized and productive.</p>
          </div>
          <NewTaskForm onTaskCreate={handleTaskCreate} />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort by: {sortOption === 'dueDate' ? 'Due Date' : 'Priority'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setSortOption('dueDate')}>Due Date</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSortOption('priority')}>Priority</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TabsContent value="pending">
            <div className="space-y-8">
              {overdueTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-destructive mb-2">Overdue</h3>
                  <TaskList tasks={overdueTasks} onToggleComplete={handleToggleComplete} />
                  <Separator className="my-6" />
                </div>
              )}
              {todayTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Today</h3>
                  <TaskList tasks={todayTasks} onToggleComplete={handleToggleComplete} />
                   {upcomingTasks.length > 0 && <Separator className="my-6" />}
                </div>
              )}
              {upcomingTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upcoming</h3>
                  <TaskList tasks={upcomingTasks} onToggleComplete={handleToggleComplete} />
                </div>
              )}
              {pendingTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">All caught up!</h3>
                    <p className="text-muted-foreground mt-2">No pending tasks. Create one to get started.</p>
                  </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="completed">
            <TaskList tasks={completedTasks} onToggleComplete={handleToggleComplete} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
