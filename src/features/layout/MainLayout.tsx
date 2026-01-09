import React from 'react';
import { ErrorBoundary } from '../../shared/components';

interface MainLayoutProps {
  children: React.ReactNode;
  folderDrawer?: React.ReactNode;
  isFolderDrawerOpen?: boolean;
  isSidebarPinned?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, folderDrawer }) => {
  return (
    <>
      {/* Sidebar / Folder Drawer */}
      {folderDrawer && <ErrorBoundary featureName="collections">{folderDrawer}</ErrorBoundary>}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-full">{children}</div>
    </>
  );
};
