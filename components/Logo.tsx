import React from 'react';
import { Theme } from '../types';

interface LogoProps {
  theme: Theme; // Used for potential internal logic if needed, but primarily relies on parent's text color
  className?: string; // Allows passing additional classes for sizing, etc.
}

const Logo: React.FC<LogoProps> = ({ theme, className }) => {
  // The new logo is a stylized king's crown with a prominent cross,
  // designed to be distinct from a queen's crown.
  const accentColorClass = theme === 'dark' ? 'text-amber-300' : 'text-amber-600';

  return (
    <svg
      viewBox="0 0 50 50" // A square viewbox
      xmlns="http://www.w3.org/2000/svg"
      className={`fill-current ${className}`}
      aria-labelledby="logoTitle"
      role="img"
    >
      <title id="logoTitle">Classic Chess King Logo</title>
      
      {/* Base of the crown */}
      <path 
        d="M5 45 H 45 V 38 H 5 Z" 
        fillOpacity="0.8"
      />

      {/* Main prongs of the crown */}
      <path 
        d="M5 38 L 10 18 L 20 30 L 25 10 L 30 30 L 40 18 L 45 38 Z"
        fillOpacity="0.8"
      />

      {/* Cross on the central prong */}
      <path 
        d="M23 8 L 27 8 L 27 4 L 23 4 Z M21 12 L 29 12 L 29 8 L 21 8 Z"
        className={accentColorClass}
        fill="currentColor"
      />
    </svg>
  );
};

export default Logo;