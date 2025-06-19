import React from 'react';
import { GameMode, Theme } from '../types'; // Added Theme

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
  onViewHallOfFame: () => void;
  theme: Theme; // Added theme prop
}

// THIS COMPONENT IS FULLY DEPRECATED.
// Its UI elements for cards are now part of App.tsx's "Welcome Arena" view.
// This file is no longer used by App.tsx.

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode, onViewHallOfFame, theme }) => {
  const panelBgClass = theme === 'dark' ? 'bg-slate-700/30 backdrop-blur-2xl border-slate-500/30 shadow-black/40' : 'bg-white/50 backdrop-blur-2xl border-gray-300/50 shadow-gray-400/30';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const titleShadow = theme === 'dark' ? '0 0 8px rgba(255,255,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)';
  const cardButtonBaseClasses = `relative group w-full max-w-[10rem] h-40 rounded-xl shadow-xl hover:shadow-2xl focus:outline-none transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center overflow-hidden p-3 text-center font-semibold focus:ring-offset-2 backdrop-blur-xl border ${theme === 'dark' ? 'text-white border-white/20 focus:ring-offset-slate-800' : 'text-slate-800 border-gray-400/60 focus:ring-offset-gray-100'}`;
  const smallTextColor = theme === 'dark' ? 'text-slate-300/90' : 'text-slate-700/90';
  const footerTextColor = theme === 'dark' ? 'text-slate-400/80' : 'text-slate-600/90';


  const getCardColors = (baseColorName: string) => {
    if (theme === 'dark') {
      if (baseColorName === 'friend') return 'from-teal-500/80 to-green-500/80 hover:from-teal-500/90 hover:to-green-500/90 focus:ring-teal-400';
      if (baseColorName === 'computer') return 'from-rose-600/80 to-red-700/80 hover:from-rose-600/90 hover:to-red-700/90 focus:ring-rose-500';
      if (baseColorName === 'online') return 'from-sky-600/80 to-indigo-600/80 hover:from-sky-600/90 hover:to-indigo-600/90 focus:ring-sky-400';
      if (baseColorName === 'hof') return 'from-amber-500/80 to-orange-600/80 hover:from-amber-500/90 hover:to-orange-600/90 focus:ring-amber-400';
    } else { // Light theme
      if (baseColorName === 'friend') return 'from-teal-400/90 to-green-400/90 hover:from-teal-500/90 hover:to-green-500/90 focus:ring-teal-300';
      if (baseColorName === 'computer') return 'from-rose-500/90 to-red-500/90 hover:from-rose-600/90 hover:to-red-600/90 focus:ring-rose-300';
      if (baseColorName === 'online') return 'from-sky-500/90 to-indigo-500/90 hover:from-sky-600/90 hover:to-indigo-600/90 focus:ring-sky-300';
      if (baseColorName === 'hof') return 'from-amber-400/90 to-orange-500/90 hover:from-amber-500/90 hover:to-orange-600/90 focus:ring-amber-300';
    }
    return '';
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-transparent">
      <div className={`p-5 sm:p-8 rounded-2xl text-center max-w-sm sm:max-w-md w-full ${panelBgClass}`}>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 ${titleColorClass}`} style={{ textShadow: titleShadow }}>
          Choose Your Game
        </h1>
        
        <div className="grid grid-cols-2 gap-4 place-items-center">
          <button
            onClick={() => onSelectMode('friend')}
            className={`${cardButtonBaseClasses} bg-gradient-to-br ${getCardColors('friend')}`}
            aria-label="Play with a friend"
          >
            <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🧑‍🤝‍🧑</span>
            <span className="text-sm">Play Friend</span>
          </button>
          
          <button
            onClick={() => onSelectMode('computer')}
            className={`${cardButtonBaseClasses} bg-gradient-to-br ${getCardColors('computer')}`}
            aria-label="Play with computer"
          >
            <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🤖</span>
            <span className="text-sm">Play Computer</span>
          </button>
          
          <button
            onClick={() => onSelectMode('online')}
            className={`${cardButtonBaseClasses} bg-gradient-to-br ${getCardColors('online')}`}
            aria-label="Play Online"
          >
            <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🌐</span>
            <span className="text-sm">Play Online (Beta)</span>
          </button>
          
          <button
            onClick={onViewHallOfFame}
            className={`${cardButtonBaseClasses} bg-gradient-to-br ${getCardColors('hof')}`}
            aria-label="View Hall of Fame"
          >
            <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🏆</span>
            <span className="text-sm">Hall of Fame</span>
          </button>
        </div>
        
        <p className={`mt-8 sm:mt-10 text-xs sm:text-sm max-w-lg mx-auto ${smallTextColor}`}>
          Select a mode or view past champions! "Play Online" is a local simulation.
        </p>
      </div>
       <footer className={`absolute bottom-4 text-xs ${footerTextColor}`}>
        <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default ModeSelection;