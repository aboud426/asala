import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TopLoadingBar } from '@/components/ui/TopLoadingBar';
import { useDirection } from '@/contexts/DirectionContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isRTL } = useDirection();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopLoadingBar />
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Navbar onSidebarToggle={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      
      <main
        className={cn(
          'pt-16 transition-all duration-300 ease-in-out',
          sidebarCollapsed 
            ? isRTL ? 'mr-16' : 'ml-16'
            : isRTL ? 'mr-64' : 'ml-64'
        )}
      >
        <div className="p-6 page-transition-enter-active">
          {children}
        </div>
      </main>
    </div>
  );
};