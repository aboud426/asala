import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { SearchSuggestions } from '@/components/ui/search-suggestions';
import { useTheme } from '@/contexts/ThemeContext';
import { useDirection } from '@/contexts/DirectionContext';
import { cn } from '@/lib/utils';
import { searchPages, SearchableItem } from '@/lib/searchConfig';

interface NavbarProps {
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle, sidebarCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const { direction, setDirection, isRTL } = useDirection();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchableItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut state
  const keyBufferRef = useRef<string>('');
  const keyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1); // Reset selected index when typing

    if (query.trim().length > 0) {
      const results = searchPages(query, isRTL);
      setSearchSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search item selection
  const handleSearchSelect = (item: SearchableItem) => {
    navigate(item.href); // Navigate to the selected page
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setSelectedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0 && searchSuggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    }
  };

  // Handle highlighting suggestions
  const handleHighlight = (index: number) => {
    setSelectedIndex(index);
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global keyboard shortcut listener for "sss"
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input, textarea, or contenteditable
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true' ||
        activeElement.getAttribute('role') === 'textbox'
      );

      if (isTyping) {
        return;
      }

      // Don't trigger on special keys
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      // Add the pressed key to buffer
      const key = event.key.toLowerCase();
      if (key.length === 1) {
        keyBufferRef.current += key;

        // Keep only the last 3 characters
        if (keyBufferRef.current.length > 3) {
          keyBufferRef.current = keyBufferRef.current.slice(-3);
        }

        // Check if we have "sss"
        if (keyBufferRef.current === '\\' || keyBufferRef.current === '\\') {
          event.preventDefault();
          keyBufferRef.current = ''; // Clear buffer

          // Focus the search input
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
        }

        // Clear buffer after 2 seconds of inactivity
        if (keyTimeoutRef.current) {
          clearTimeout(keyTimeoutRef.current);
        }
        keyTimeoutRef.current = setTimeout(() => {
          keyBufferRef.current = '';
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      if (keyTimeoutRef.current) {
        clearTimeout(keyTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          const selectedItem = searchSuggestions[selectedIndex];
          handleSearchSelect(selectedItem);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        break;
    }
  };

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
          <div ref={searchContainerRef} className="relative w-96 max-w-sm">
            <Search className={cn(
              'absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10',
              isRTL ? 'right-3' : 'left-3'
            )} />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder={isRTL ? 'البحث في الصفحات... (اكتب \\)' : 'Search pages... (type \\)'}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full transition-smooth focus:ring-2 focus:ring-primary/20',
                isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4',
                showSuggestions && 'focus:border-primary'
              )}
              autoComplete="off"
            />

            <SearchSuggestions
              suggestions={searchSuggestions}
              isVisible={showSuggestions}
              onSelect={handleSearchSelect}
              onClose={() => {
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }}
              searchQuery={searchQuery}
              selectedIndex={selectedIndex}
              onHighlight={handleHighlight}
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