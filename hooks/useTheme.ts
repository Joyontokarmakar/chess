
import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';
import { getThemePreference, setThemePreference } from '../utils/localStorageUtils';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => getThemePreference() || 'dark');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    setThemePreference(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
};
