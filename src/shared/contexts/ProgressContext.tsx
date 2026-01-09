import React, { createContext, useContext, useState, useCallback } from 'react';
export interface ProgressTask {
  id: string;
  label: string;
  progress: number; // 0 to 100
  status: 'active' | 'completed' | 'error';
  message?: string;
}

interface ProgressContextType {
  tasks: ProgressTask[];
  addTask: (task: Omit<ProgressTask, 'progress' | 'status'>) => void;
  updateTask: (
    id: string,
    updates: Partial<Pick<ProgressTask, 'progress' | 'status' | 'message'>>
  ) => void;
  removeTask: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<ProgressTask[]>([]);

  const addTask = useCallback((task: Omit<ProgressTask, 'progress' | 'status'>) => {
    setTasks((prev) => [...prev, { ...task, progress: 0, status: 'active' }]);
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<ProgressTask, 'progress' | 'status' | 'message'>>) => {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
    },
    []
  );

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  return (
    <ProgressContext.Provider value={{ tasks, addTask, updateTask, removeTask }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
