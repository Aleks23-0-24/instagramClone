import { useContext } from 'react';
import { ThemeContext } from '@/app/context/ThemeContext';
import { Appearance } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  const ctx = useContext(ThemeContext as any);
  if (ctx && ctx.theme) return ctx.theme;
  const sys = Appearance.getColorScheme();
  return sys === 'dark' ? 'dark' : 'light';
}

