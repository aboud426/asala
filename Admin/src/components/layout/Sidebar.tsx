import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  // ChevronLeft,
  Store,
  Globe,
  MessageSquare,
  FolderTree,
  ShoppingBag,
  Shield,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDirection } from '@/contexts/DirectionContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: 'Dashboard',
    titleAr: 'لوحة التحكم',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    titleAr: 'الطلبات',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Products',
    titleAr: 'المنتجات',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Customers',
    titleAr: 'العملاء',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Providers',
    titleAr: 'مقدمو الخدمات',
    href: '/providers',
    icon: Store,
  },
  {
    title: 'Analytics',
    titleAr: 'التحليلات',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Languages',
    titleAr: 'اللغات',
    href: '/languages',
    icon: Globe,
  },
  {
    title: 'Categories',
    titleAr: 'الفئات',
    href: '/categories',
    icon: FolderTree,
  },
  {
    title: 'Product Categories',
    titleAr: 'فئات المنتجات',
    href: '/product-categories',
    icon: ShoppingBag,
  },
  {
    title: 'Messages',
    titleAr: 'الرسائل',
    href: '/messages',
    icon: MessageSquare,
  },
  {
    title: 'Roles',
    titleAr: 'الأدوار',
    href: '/roles',
    icon: Shield,
  },
  {
    title: 'Permissions',
    titleAr: 'الصلاحيات',
    href: '/permissions',
    icon: Key,
  },
  {
    title: 'Settings',
    titleAr: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { isRTL } = useDirection();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        isRTL ? 'right-0' : 'left-0',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Asala</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          )}
        </div>

        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'h-8 w-8 p-0 hover:bg-sidebar-accent transition-smooth',
            isCollapsed && 'hidden'
          )}
        > */}
        {/* <ChevronLeft className={cn('h-4 w-4', isRTL && 'rotate-180')} /> */}
        {/* </Button> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth hover-lift',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground',
                  isCollapsed && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span>{isRTL ? item.titleAr : item.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Admin User
              </p>
              <p className="text-xs text-muted-foreground truncate">
                admin@asala.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};