import React from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  Menu,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useDirection } from '@/contexts/DirectionContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle, sidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { direction, setDirection, isRTL } = useDirection();

  return (
    <header
      className={cn(
        'fixed top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300',
        sidebarCollapsed 
          ? isRTL ? 'right-16 left-0' : 'left-16 right-0'
          : isRTL ? 'right-64 left-0' : 'left-64 right-0'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Search */}
          <div className="relative w-64 max-w-sm">
            <Search className={cn(
              'absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground',
              isRTL ? 'right-3' : 'left-3'
            )} />
            <Input
              type="search"
              placeholder={isRTL ? 'البحث...' : 'Search...'}
              className={cn(
                'w-full transition-smooth focus:ring-2 focus:ring-primary/20',
                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
              )}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Language / اللغة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDirection('ltr')}
                className={cn(direction === 'ltr' && 'bg-accent')}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDirection('rtl')}
                className={cn(direction === 'rtl' && 'bg-accent')}
              >
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-3 w-3 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {isRTL ? 'حسابي' : 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {isRTL ? 'الملف الشخصي' : 'Profile'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {isRTL ? 'الإعدادات' : 'Settings'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                {isRTL ? 'تسجيل خروج' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};