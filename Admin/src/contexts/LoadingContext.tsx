import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  setProgress: (progress: number) => void;
  finishLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
    
    // Simulate progressive loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Stop at 90% and wait for finishLoading
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);
  }, []);

  const finishLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200); // Small delay to show completion
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(newProgress, 100));
  }, []);

  const value: LoadingContextType = {
    isLoading,
    progress,
    startLoading,
    setProgress: updateProgress,
    finishLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};
