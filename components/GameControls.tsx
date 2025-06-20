import React from 'react';
import { Theme } from '../types';

interface GameControlsProps {
  theme: Theme;
  onUndo: () => void;
  canUndo: boolean;
  onHint: () => void;
  canHint: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ theme, onUndo, canUndo, onHint, canHint }) => {
  const buttonBaseClasses = `font-semibold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center justify-center gap-x-1.5 min-w-[100px]`;

  const getButtonTheme = (action: 'undo' | 'hint') => {
    if (theme === 'dark') {
      if (action === 'undo') return `bg-amber-600/80 hover:bg-amber-500/90 border border-amber-500/60 text-white focus-visible:ring-amber-400`;
      if (action === 'hint') return `bg-sky-600/80 hover:bg-sky-500/90 border border-sky-500/60 text-white focus-visible:ring-sky-400`;
    } else { // Light theme
      if (action === 'undo') return `bg-amber-500/90 hover:bg-amber-600/95 border border-amber-400/70 text-white focus-visible:ring-amber-500`;
      if (action === 'hint') return `bg-sky-500/90 hover:bg-sky-600/95 border border-sky-400/70 text-white focus-visible:ring-sky-500`;
    }
    return '';
  };

  return (
    <div className="flex space-x-3 mt-2 mb-1">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${buttonBaseClasses} ${getButtonTheme('undo')}`}
        aria-label="Undo last move"
      >
        <span role="img" aria-hidden="true" className="text-lg">↩️</span> Undo
      </button>
      <button
        onClick={onHint}
        disabled={!canHint}
        className={`${buttonBaseClasses} ${getButtonTheme('hint')}`}
        aria-label="Request a hint"
      >
        <span role="img" aria-hidden="true" className="text-lg">💡</span> Hint
      </button>
    </div>
  );
};

export default GameControls;
