import React, { createContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { safeGetItem, safeSetItem } from '@/app/utils/runtimeConfig';

const THEME_KEY = 'APP_THEME';

type ThemeType = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (t: ThemeType) => Promise<void>;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'));

  useEffect(() => {
    (async () => {
      try {
        const v = await safeGetItem(THEME_KEY);
        if (v === 'light' || v === 'dark') setThemeState(v as ThemeType);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const setTheme = async (t: ThemeType) => {
    try {
      await safeSetItem(THEME_KEY, t);
    } catch (e) {
      // ignore
    }
    setThemeState(t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

// Default export to satisfy expo-router which treats app/context as routes.
export default function ThemeContextRoute() {
  return null;
}
