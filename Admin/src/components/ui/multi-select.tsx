import React, { forwardRef, useState } from "react";
import { Check, ChevronDown, X, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  options?: MultiSelectOption[];
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
  searchPlaceholder?: string;
  emptyText?: string;
}

const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ 
    value = [], 
    onValueChange, 
    placeholder = "Select items...", 
    options = [], 
    children, 
    className, 
    disabled = false,
    maxDisplay = 3,
    searchPlaceholder = "Search...",
    emptyText = "No results found."
  }, ref) => {
    const [open, setOpen] = useState(false);

    const handleUnselect = (option: string) => {
      if (onValueChange) {
        onValueChange(value.filter((item) => item !== option));
      }
    };

    const handleSelect = (optionValue: string) => {
      if (onValueChange) {
        const isSelected = value.includes(optionValue);
        if (isSelected) {
          onValueChange(value.filter((item) => item !== optionValue));
        } else {
          onValueChange([...value, optionValue]);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const input = e.target as HTMLInputElement;
      if (input.value === "") {
        if (e.key === "Backspace" && value.length > 0) {
          handleUnselect(value[value.length - 1]);
        }
        if (e.key === "Escape") {
          input.blur();
          setOpen(false);
        }
      }
    };

    const selectedItems = options?.filter((option) => value.includes(option.value)) || [];
    const displayItems = selectedItems.slice(0, maxDisplay);
    const remainingCount = selectedItems.length - maxDisplay;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "min-h-10 h-auto justify-between text-left font-normal",
              "focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "hover:bg-accent hover:text-accent-foreground",
              className
            )}
            disabled={disabled}
            onClick={() => setOpen(!open)}
          >
            <div className="flex-1 flex items-center gap-1 flex-wrap overflow-hidden">
              {selectedItems.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap w-full">
                  {displayItems.map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className={cn(
                        "px-2 py-1 text-xs font-medium",
                        "bg-primary/10 text-primary border-primary/20",
                        "hover:bg-primary/20 transition-colors duration-200",
                        "flex items-center gap-1"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(option.value);
                      }}
                    >
                      <Tags className="h-3 w-3" />
                      <span className="max-w-[120px] truncate">{option.label}</span>
                      <X className="h-3 w-3 text-primary/70 hover:text-primary cursor-pointer" />
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                      +{remainingCount} more
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              {selectedItems.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="px-1.5 py-0.5 text-xs bg-primary/5 text-primary border-primary/20"
                >
                  {selectedItems.length}
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                open && "transform rotate-180"
              )} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="h-10 border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="max-h-64">
                  {options.map((option) => {
                    const isSelected = value.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className={cn(
                          "flex items-center justify-between py-2 px-3 cursor-pointer",
                          "hover:bg-accent hover:text-accent-foreground",
                          isSelected && "bg-accent/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{option.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary font-medium" />
                        )}
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
            {selectedItems.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    if (onValueChange) {
                      onValueChange([]);
                    }
                  }}
                >
                  Clear all ({selectedItems.length})
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

// Re-export components for backward compatibility
const MultiSelectTrigger = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const MultiSelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span>{placeholder}</span>;
};

const MultiSelectContent = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const MultiSelectList = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

const MultiSelectItem = ({ value, children, ...props }: { value: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div data-value={value} {...props}>
      {children}
    </div>
  );
};

export { 
  MultiSelect, 
  MultiSelectTrigger, 
  MultiSelectValue, 
  MultiSelectContent, 
  MultiSelectList, 
  MultiSelectItem,
  type MultiSelectOption 
};
