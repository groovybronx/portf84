import React from 'react';
import { Icon as LucideIcon, type IconAction } from '../../Icon';
interface SettingRowProps {
  label: string;
  description?: string;
  icon?: IconAction;
  children?: React.ReactNode;
  className?: string;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-glass-bg-accent border border-glass-border flex items-center justify-center shrink-0">
            <LucideIcon action={icon} size={16} className="text-white/70" />
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          {description && <div className="text-[10px] text-white/40">{description}</div>}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
};
