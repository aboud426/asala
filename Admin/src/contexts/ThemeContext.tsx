import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ColorTheme = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'neutral' | 'stone';
type FontTheme = 'inter' | 'roboto' | 'poppins' | 'system' | 'nunito' | 'source-sans' | 'work-sans' | 'dosis' | 'outfit' | 'space-grotesk' | 'amiri' | 'cairo' | 'tajawal' | 'almarai' | 'noto-sans-arabic' | 'scheherazade' | 'markazi-text' | 'reem-kufi' | 'changa' | 'ibm-plex-sans-arabic';

interface ThemeSettings {
  mode: Theme;
  colorTheme: ColorTheme;
  fontTheme: FontTheme;
}

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  fontTheme: FontTheme;
  themeSettings: ThemeSettings;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setFontTheme: (fontTheme: FontTheme) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const defaultThemeSettings: ThemeSettings = {
  mode: 'light',
  colorTheme: 'blue',
  fontTheme: 'inter'
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('asala-theme-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          return { ...defaultThemeSettings, ...parsed };
        }
      } catch (error) {
        console.error('Error parsing theme settings from localStorage:', error);
      }
      
      // Fallback: check old theme storage and system preference
      const savedTheme = localStorage.getItem('asala-theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const mode = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : systemTheme;
      
      return { ...defaultThemeSettings, mode };
    }
    return defaultThemeSettings;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply theme mode
    root.classList.remove('light', 'dark');
    root.classList.add(themeSettings.mode);
    
    // Apply color theme
    root.classList.remove(
      'theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-red', 'theme-pink',
      'theme-cyan', 'theme-indigo', 'theme-emerald', 'theme-amber', 'theme-rose', 
      'theme-slate', 'theme-neutral', 'theme-stone'
    );
    root.classList.add(`theme-${themeSettings.colorTheme}`);
    
    // Apply font theme
    root.classList.remove(
      'font-inter', 'font-roboto', 'font-poppins', 'font-system', 'font-nunito',
      'font-source-sans', 'font-work-sans', 'font-dosis', 'font-outfit', 'font-space-grotesk',
      'font-amiri', 'font-cairo', 'font-tajawal', 'font-almarai', 'font-noto-sans-arabic',
      'font-scheherazade', 'font-markazi-text', 'font-reem-kufi', 'font-changa', 'font-ibm-plex-sans-arabic'
    );
    root.classList.add(`font-${themeSettings.fontTheme}`);
    
    // Save to localStorage
    localStorage.setItem('asala-theme-settings', JSON.stringify(themeSettings));
    // Keep backward compatibility
    localStorage.setItem('asala-theme', themeSettings.mode);
  }, [themeSettings]);

  const setTheme = (mode: Theme) => {
    setThemeSettings(prev => ({ ...prev, mode }));
  };

  const setColorTheme = (colorTheme: ColorTheme) => {
    setThemeSettings(prev => ({ ...prev, colorTheme }));
  };

  const setFontTheme = (fontTheme: FontTheme) => {
    setThemeSettings(prev => ({ ...prev, fontTheme }));
  };

  const updateThemeSettings = (settings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({ ...prev, ...settings }));
  };

  const toggleTheme = () => {
    setTheme(themeSettings.mode === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme: themeSettings.mode,
    colorTheme: themeSettings.colorTheme,
    fontTheme: themeSettings.fontTheme,
    themeSettings,
    setTheme,
    setColorTheme,
    setFontTheme,
    updateThemeSettings,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};