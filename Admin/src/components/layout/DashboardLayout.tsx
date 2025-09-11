import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TopLoadingBar } from '@/components/ui/TopLoadingBar';
import { useDirection } from '@/contexts/DirectionContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load initial state from localStorage
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const { isRTL } = useDirection();

  // Save sidebar collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

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