import React, { createContext, useContext, useEffect, useState } from 'react';

type Direction = 'ltr' | 'rtl';

interface DirectionContextType {
  direction: Direction;
  setDirection: (direction: Direction) => void;
  isRTL: boolean;
}

const DirectionContext = createContext<DirectionContextType | undefined>(undefined);

export const useDirection = () => {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
};

interface DirectionProviderProps {
  children: React.ReactNode;
}

export const DirectionProvider: React.FC<DirectionProviderProps> = ({ children }) => {
  const [direction, setDirection] = useState<Direction>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asala-direction');
      if (saved === 'ltr' || saved === 'rtl') {
        return saved;
      }
    }
    return 'ltr';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', direction);
    localStorage.setItem('asala-direction', direction);
  }, [direction]);

  const value = {
    direction,
    setDirection,
    isRTL: direction === 'rtl',
  };

  return (
    <DirectionContext.Provider value={value}>
      {children}
    </DirectionContext.Provider>
  );
};