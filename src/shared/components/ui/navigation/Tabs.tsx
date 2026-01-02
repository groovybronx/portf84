import React from "react";
import { cn } from "../../../utils/cn";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex", className)} {...props}>
      {children}
    </div>
  );
};

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return (
    <div className={cn("w-64 bg-glass-bg-accent border-r border-glass-border p-4 flex flex-col gap-2", className)}>
      {children}
    </div>
  );
};

interface TabTriggerProps {
  value: string;
  activeValue?: string; // Passed from parent usually, but here we might need context or explicit passing
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  active?: boolean; // Simplify for direct usage
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  active,
  onClick,
  children,
  icon,
  className,
}) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all justify-start h-auto",
        active
          ? "bg-primary/20 text-primary border border-primary/30"
          : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10",
        className
      )}
    >
      {icon}
      {children}
    </Button>
  );
};

interface TabContentProps {
  value: string;
  activeValue?: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export const TabContent: React.FC<TabContentProps> = ({
  active,
  children,
  className,
}) => {
  if (!active) return null;
  return (
    <div className={cn("flex-1 overflow-y-auto p-8", className)}>
      {children}
    </div>
  );
};
