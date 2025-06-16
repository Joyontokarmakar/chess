import React from 'react';
import { GameMode } from '../types';

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  return (
    // Adjusted padding and max-width to fit better within InitialScreen flow
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl text-center max-w-md w-full border border-stone-300">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6 sm:mb-8">Choose Your Game</h2>
      <div className="space-y-4 sm:space-y-5">
        <button
          onClick={() => onSelectMode('friend')}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          aria-label="Play with a friend"
        >
          Play with Friend
        </button>
        <button
          onClick={() => onSelectMode('computer')}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-5 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          aria-label="Play with computer"
        >
          Play with Computer (AI)
        </button>
      </div>
      <p className="mt-6 sm:mt-8 text-sm text-stone-500">
        Select a mode to start your chess adventure!
      </p>
    </div>
    // Footer removed as InitialScreen will have a global one
  );
};

export default ModeSelection;
