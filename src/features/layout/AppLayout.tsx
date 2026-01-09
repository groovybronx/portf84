import React from 'react';
import { ErrorBoundary } from '../../shared/components';

interface AppLayoutProps {
  topBar: React.ReactNode;
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  tagHub: React.ReactNode;
  isFolderDrawerOpen: boolean;
  isSidebarPinned: boolean;
  isTagHubOpen: boolean;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  topBar,
  sidebar,
  mainContent,
  tagHub,
  isFolderDrawerOpen,
  isSidebarPinned,
  isTagHubOpen,
  children,
}) => {
  return (
    <div className="main-app bg-surface h-screen overflow-hidden flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-(--z-base) bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

      {/* TopBar - Always visible */}
      <ErrorBoundary featureName="navigation">
        <div className="top-bar-area relative z-(--z-topbar)">{topBar}</div>
      </ErrorBoundary>

      {/* App Layout: Sidebar + Main Content */}
      <div
        className={`flex-1 flex flex-row overflow-hidden relative transition-all duration-300 ${
          isFolderDrawerOpen || isSidebarPinned ? 'pl-80' : ''
        } ${isTagHubOpen ? 'pr-[min(20rem,20vw)]' : ''}`}
      >
        {sidebar}
        {mainContent}
        {children}
      </div>

      {/* TagHub */}
      {tagHub}
    </div>
  );
};
