

import React from 'react';
import { SavedGame, Theme } from '../types';

interface SavedGamesListProps {
  savedGames: SavedGame[];
  onLoadGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onClearAll: () => void;
  onBack: () => void; // This is used by MenuModal to switch view, title is now handled by MenuModal
  theme: Theme;
}

const SavedGamesList: React.FC<SavedGamesListProps> = ({
  savedGames,
  onLoadGame,
  onDeleteGame,
  onClearAll,
  onBack,
  theme,
}) => {
  // Title is now handled by MenuModal's dynamic header
  // const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const itemBgClass = theme === 'dark' ? 'bg-slate-700/70 border-slate-600/60' : 'bg-gray-100/80 border-gray-300/70';
  const itemHoverBgClass = theme === 'dark' ? 'hover:bg-slate-600/80' : 'hover:bg-gray-200/90';
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const dateColorClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  
  const buttonBase = "font-semibold py-2 px-4 rounded-md text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 text-white border-transparent";
  const loadButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 hover:from-sky-500/95 hover:to-blue-600/95 focus-visible:ring-sky-400' : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus-visible:ring-sky-400'}`;
  const deleteButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-gradient-to-r from-red-700/90 to-rose-800/90 hover:from-red-600/95 hover:to-rose-700/95 focus-visible:ring-red-500' : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 focus-visible:ring-red-500'}`;

  const wideButtonBase = `font-semibold py-2.5 px-4 rounded-lg text-sm shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  const clearAllButtonClass = `${wideButtonBase} w-full mt-3 sm:w-auto ${theme === 'dark' ? 'text-white bg-gradient-to-r from-amber-600/80 to-red-700/80 hover:from-amber-500/90 hover:to-red-600/90 focus-visible:ring-amber-400' : 'text-white bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 focus-visible:ring-amber-500'}`;
  const backButtonClass = `${wideButtonBase} w-full mt-3 sm:w-auto ${theme === 'dark' ? 'text-slate-200 bg-slate-600/70 hover:bg-slate-500/80 border border-slate-500/50 focus-visible:ring-slate-400' : 'text-slate-700 bg-gray-300/80 hover:bg-gray-400/90 border border-gray-400/60 focus-visible:ring-gray-500'}`;
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50';

  return (
    <div className="w-full">
      {/* Title is now part of the MenuModal's dynamic header 
        <h3 className={`text-xl sm:text-2xl font-bold mb-4 text-center ${titleColorClass}`}>Saved Games</h3> 
      */}
      {savedGames.length === 0 ? (
        <p className={`text-center my-6 ${textColorClass}`}>No games saved yet.</p>
      ) : (
        <ul className={`space-y-3 max-h-60 sm:max-h-72 overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarStyles}`}>
          {savedGames.map((game) => (
            <li
              key={game.id}
              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between transition-colors duration-150 ${itemBgClass} ${itemHoverBgClass}`}
            >
              <div className="flex-grow mb-2 sm:mb-0">
                <p className={`font-semibold text-sm sm:text-base ${textColorClass}`}>{game.name}</p>
                <p className={`text-xs ${dateColorClass}`}>
                  {new Date(game.timestamp).toLocaleString()} - ({game.gameMode.replace('_', ' ')})
                </p>
              </div>
              <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
                <button onClick={() => onLoadGame(game.id)} className={loadButtonClass}>
                  Load
                </button>
                <button onClick={() => onDeleteGame(game.id)} className={deleteButtonClass}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-col sm:flex-row-reverse sm:justify-between items-center gap-3">
        {savedGames.length > 0 && (
            <button onClick={onClearAll} className={clearAllButtonClass}>
                Clear All Saved Games
            </button>
        )}
        <button onClick={onBack} className={backButtonClass}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default SavedGamesList;
