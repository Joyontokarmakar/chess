import React from 'react';
import { Theme, Puzzle } from '../types';

interface PuzzleControlsProps {
  theme: Theme;
  puzzle: Puzzle;
  // puzzleMessage: string; // Removed, will be handled by toasts
  onNextPuzzle: () => void;
  onPrevPuzzle: () => void;
  onResetPuzzle: () => void;
  isFirstPuzzle: boolean;
  isLastPuzzle: boolean;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  theme,
  puzzle,
  // puzzleMessage, // Removed
  onNextPuzzle,
  onPrevPuzzle,
  onResetPuzzle,
  isFirstPuzzle,
  isLastPuzzle,
}) => {
  const panelBgClass = theme === 'dark' ? 'bg-slate-700/50 backdrop-blur-xl border border-slate-600/40' : 'bg-white/70 backdrop-blur-xl border border-gray-300/50';
  const titleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-600';
  const descriptionColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  // const messageColorClass = theme === 'dark' ? 'text-yellow-300 font-semibold' : 'text-yellow-600 font-semibold'; // Removed
  
  const buttonBaseClasses = `font-semibold py-2 px-4 rounded-md text-xs shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`;

  const getButtonTheme = (type: 'nav' | 'reset') => {
    if (theme === 'dark') {
      if (type === 'nav') return `bg-indigo-600/70 hover:bg-indigo-500/80 border border-indigo-500/50 text-white focus-visible:ring-indigo-400`;
      if (type === 'reset') return `bg-rose-600/70 hover:bg-rose-500/80 border border-rose-500/50 text-white focus-visible:ring-rose-400`;
    } else { // Light
      if (type === 'nav') return `bg-indigo-500/80 hover:bg-indigo-600/90 border border-indigo-400/60 text-white focus-visible:ring-indigo-500`;
      if (type === 'reset') return `bg-rose-500/80 hover:bg-rose-600/90 border border-rose-400/60 text-white focus-visible:ring-rose-500`;
    }
    return '';
  };


  return (
    <div className={`p-3 sm:p-4 shadow-xl w-full max-w-md text-center rounded-xl ${panelBgClass}`}>
      <h2 className={`text-lg sm:text-xl font-bold mb-1 ${titleColorClass}`}>
        {puzzle.title} <span className="text-xs">({puzzle.difficulty})</span>
      </h2>
      <p className={`text-xs sm:text-sm mb-1.5 ${descriptionColorClass}`}>
        {puzzle.description}
      </p>
      {/* puzzleMessage display removed, will be shown via toast by App.tsx */}
      <div className="flex justify-center items-center space-x-2 sm:space-x-3 mt-2">
        <button onClick={onPrevPuzzle} disabled={isFirstPuzzle} className={`${buttonBaseClasses} ${getButtonTheme('nav')}`}>
          &lt; Prev
        </button>
        <button onClick={onResetPuzzle} className={`${buttonBaseClasses} ${getButtonTheme('reset')}`}>
          Reset
        </button>
        <button onClick={onNextPuzzle} disabled={isLastPuzzle} className={`${buttonBaseClasses} ${getButtonTheme('nav')}`}>
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default PuzzleControls;