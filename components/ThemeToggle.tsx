import React from 'react';
import { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <div className="flex items-center justify-between w-full p-2">
       <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
         Mode: {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
      <input
        type="checkbox"
        id="theme-switch"
        className="theme-switch-checkbox"
        checked={theme === 'light'}
        onChange={onToggle}
        aria-label="Toggle theme"
      />
      <label htmlFor="theme-switch" className="theme-switch-label">
        <span className="theme-switch-icon">🌙</span> {/* Moon for dark */}
        <span className="theme-switch-icon">☀️</span> {/* Sun for light */}
        <span className="theme-switch-ball"></span>
      </label>
    </div>
  );
};

export default ThemeToggle;