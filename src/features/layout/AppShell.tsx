import React from 'react';

interface AppShellProps {
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  tagHub: React.ReactNode;
  isSidebarExpanded: boolean;
  isTagHubOpen: boolean;
  children?: React.ReactNode;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
}

export const AppShell: React.FC<AppShellProps> = ({
  topBar,
  sidebar,
  mainContent,
  tagHub,
  isSidebarExpanded,
  isTagHubOpen,
  children,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  return (
    <div
      className="main-app bg-surface h-screen overflow-hidden flex flex-col"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className="fixed inset-0 pointer-events-none z-(--z-base) bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {sidebar}
        <div
          className={`flex-1 relative overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? 'ml-80' : 'ml-0'
          } ${isTagHubOpen ? 'mr-[min(20rem,20vw)]' : 'mr-0'}`}
        >
          {topBar}
          {mainContent}
        </div>
      </div>
      {tagHub}
      {children}
    </div>
  );
};
