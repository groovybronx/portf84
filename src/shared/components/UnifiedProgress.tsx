import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress, ProgressTask } from "../contexts/ProgressContext";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "./ui/Button";

export const UnifiedProgress: React.FC = () => {
  const { tasks, removeTask } = useProgress();

  if (tasks.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-(--z-overlay) flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onRemove={() => removeTask(task.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const TaskItem: React.FC<{ task: ProgressTask; onRemove: () => void }> = ({
  task,
  onRemove,
}) => {
  const isCompleted = task.status === "completed";
  const isError = task.status === "error";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      className="pointer-events-auto group relative overflow-hidden rounded-2xl glass-surface p-4 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {task.status === "active" && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-semibold text-white truncate pr-6">
              {task.label}
            </h4>
            <Button
              onClick={onRemove}
              variant="close"
              size="icon-sm"
              aria-label="Close"
              className="absolute top-3 right-3"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {task.message && (
            <p className="text-xs text-white/50 mt-0.5 truncate">
              {task.message}
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            <div className="h-1 w-full bg-glass-bg-accent rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  isError
                    ? "bg-red-500"
                    : isCompleted
                    ? "bg-emerald-500"
                    : "bg-blue-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/30">
              <span>{task.status}</span>
              <span>{Math.round(task.progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};
