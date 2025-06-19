import React from 'react';
import { Theme } from '../types';

interface LogoProps {
  theme: Theme; // Used for potential internal logic if needed, but primarily relies on parent's text color
  className?: string; // Allows passing additional classes for sizing, etc.
}

const Logo: React.FC<LogoProps> = ({ theme, className }) => {
  // The SVG will use `currentColor` for fill, so it inherits color from parent.
  // Theme prop is kept for potential future direct color assignments if needed.
  const accentColorClass = theme === 'dark' ? 'text-sky-400' : 'text-sky-600';

  return (
    <svg
      viewBox="0 0 80 50" // Adjusted viewBox for a wider, shorter crown
      xmlns="http://www.w3.org/2000/svg"
      className={`fill-current ${className}`}
      aria-labelledby="logoTitle"
      role="img"
    >
      <title id="logoTitle">Classic Chess Championship Logo</title>
      {/* Base of the crown */}
      <path 
        d="M5 45 Q 40 35 75 45 L 70 25 L 55 35 L 50 15 L 40 28 L 30 15 L 25 35 L 10 25 Z" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="round"
        fillOpacity="0.8"
      />
      {/* Gems - using a different color for accent, can be themed if needed */}
       <circle cx="15" cy="22" r="4" className={accentColorClass} fill="currentColor" />
      <circle cx="40" cy="12" r="5" className={accentColorClass} fill="currentColor" />
      <circle cx="65" cy="22" r="4" className={accentColorClass} fill="currentColor" />
    </svg>
  );
};

export default Logo;
