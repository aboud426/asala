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
  UserCheck,
  Coins,
  Tag,
  MessageCircle,
  MapPin,
  Navigation,
  Map,
  PieChart,
  LogOut,
  User,
  FileText,
  Image,
  Video,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDirection } from '@/contexts/DirectionContext';
import { useAuth } from '@/contexts/AuthContext';

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
    title: 'Posts',
    titleAr: 'المنشورات',
    href: '/posts',
    icon: MessageCircle,
  },
  {
    title: 'Reels',
    titleAr: 'الريلز',
    href: '/reels',
    icon: Video,
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
    title: 'Statistics',
    titleAr: 'الإحصائيات',
    href: '/statistics',
    icon: PieChart,
  },
  {
    title: 'Languages',
    titleAr: 'اللغات',
    href: '/languages',
    icon: Globe,
  },
  {
    title: 'Categories',
    titleAr: 'فئات البائعين',
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
    title: 'Post Types',
    titleAr: 'أنواع المنشورات',
    href: '/post-types',
    icon: Tag,
  },
  {
    title: 'Images',
    titleAr: 'الصور',
    href: '/images',
    icon: Image,
  },
  {
    title: 'Videos',
    titleAr: 'الفيديوهات',
    href: '/videos',
    icon: Video,
  },
  {
    title: 'Products Pages',
    titleAr: 'صفحات المنتجات',
    href: '/products-pages',
    icon: FileText,
  },
  {
    title: 'Posts Pages',
    titleAr: 'صفحات المنشورات',
    href: '/posts-pages',
    icon: FileText,
  },
  {
    title: 'Regions',
    titleAr: 'المناطق',
    href: '/regions',
    icon: MapPin,
  },
  {
    title: 'Locations',
    titleAr: 'المواقع',
    href: '/locations',
    icon: Navigation,
  },
  {
    title: 'Map Selector',
    titleAr: 'محدد المواقع',
    href: '/map-selector',
    icon: Map,
  },
  {
    title: 'Employees',
    titleAr: 'الموظفين',
    href: '/employees',
    icon: UserCheck,
  },
  {
    title: 'Roles',
    titleAr: 'الأدوار',
    href: '/roles',
    icon: Shield,
  },
  {
    title: 'Currencies',
    titleAr: 'العملات',
    href: '/currencies',
    icon: Coins,
  },
  {
    title: 'Permissions',
    titleAr: 'الصلاحيات',
    href: '/permissions',
    icon: Key,
  },
  {
    title: 'Rich Text Editor',
    titleAr: 'محرر النصوص',
    href: '/rich-text-editor',
    icon: Type,
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
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        isRTL ? 'right-0' : 'left-0',
        isCollapsed ? 'w-20' : 'w-64'
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 space-y-2">
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
        </div>
      </nav>

      {/* Footer - User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            {user ? (
              <span className="text-xs font-medium text-primary-foreground">
                {getUserInitials(user.name)}
              </span>
            ) : (
              <User className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || '...'}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!isCollapsed && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>{isRTL ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </Button>
          </div>
        )}

        {/* Collapsed Logout Button */}
        {isCollapsed && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title={isRTL ? 'تسجيل الخروج' : 'Sign Out'}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};