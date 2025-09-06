import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableItem } from '@/lib/searchConfig';
import { useDirection } from '@/contexts/DirectionContext';

interface SearchSuggestionsProps {
  suggestions: SearchableItem[];
  isVisible: boolean;
  onSelect: (item: SearchableItem) => void;
  onClose: () => void;
  searchQuery: string;
  selectedIndex: number;
  onHighlight: (index: number) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isVisible,
  onSelect,
  onClose,
  searchQuery,
  selectedIndex,
  onHighlight
}) => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();

  if (!isVisible || suggestions.length === 0) return null;

  const handleSelect = (item: SearchableItem) => {
    onSelect(item);
    navigate(item.href);
    onClose();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Suggestions dropdown */}
      <div className={cn(
        'absolute top-full mt-2 w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-hidden',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200',
        isRTL ? 'right-0' : 'left-0'
      )}>
        <div className="p-2">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-b border-border mb-2">
            <Search className="h-4 w-4" />
            <span>
              {isRTL 
                ? `${suggestions.length} نتائج للبحث "${searchQuery}"`
                : `${suggestions.length} results for "${searchQuery}"`
              }
            </span>
          </div>
          
          <div className="space-y-1">
            {suggestions.map((item, index) => {
              const title = isRTL ? item.titleAr : item.title;
              const description = isRTL ? item.descriptionAr : item.description;
              const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => onHighlight(index)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors duration-150 group focus:outline-none',
                    selectedIndex === index
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">
                        {highlightMatch(title, searchQuery)}
                      </div>
                      <div className="text-xs text-muted-foreground overflow-hidden max-h-8 leading-4">
                        {highlightMatch(description, searchQuery)}
                      </div>
                    </div>
                    <ChevronIcon className={cn(
                      'h-4 w-4 transition-colors flex-shrink-0 ml-2',
                      selectedIndex === index
                        ? 'text-accent-foreground'
                        : 'text-muted-foreground group-hover:text-accent-foreground'
                    )} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {suggestions.length === 5 && (
          <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border bg-muted/50">
            {isRTL 
              ? 'اكتب للحصول على مزيد من النتائج'
              : 'Type more to see additional results'
            }
          </div>
        )}
      </div>
    </>
  );
};
