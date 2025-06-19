import React from 'react';
import { SavedGame, Theme } from '../types';

interface SavedGamesListProps {
  savedGames: SavedGame[];
  onLoadGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onClearAll: () => void;
  onBack: () => void;
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
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const itemBgClass = theme === 'dark' ? 'bg-slate-700/70 border-slate-600/60' : 'bg-gray-100/80 border-gray-300/70';
  const itemHoverBgClass = theme === 'dark' ? 'hover:bg-slate-600/80' : 'hover:bg-gray-200/90';
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const dateColorClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  
  const buttonBase = "font-semibold py-2 px-4 rounded-md text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75";
  const loadButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-sky-600/90 hover:bg-sky-500/95 text-white focus-visible:ring-sky-400' : 'bg-sky-500 hover:bg-sky-600 text-white focus-visible:ring-sky-300'}`;
  const deleteButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-red-700/90 hover:bg-red-600/95 text-white focus-visible:ring-red-500' : 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-400'}`;
  const clearAllButtonClass = `${buttonBase} w-full mt-3 sm:w-auto ${theme === 'dark' ? 'bg-rose-700/90 hover:bg-rose-600/95 text-white focus-visible:ring-rose-500' : 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-400'}`;
  const backButtonClass = `${buttonBase} w-full mt-3 sm:w-auto ${theme === 'dark' ? 'bg-slate-600/80 hover:bg-slate-500/90 text-slate-200 focus-visible:ring-slate-400' : 'bg-gray-300/90 hover:bg-gray-400/95 text-slate-700 focus-visible:ring-gray-500'}`;

  return (
    <div className="w-full">
      <h3 className={`text-xl sm:text-2xl font-bold mb-4 text-center ${titleColorClass}`}>Saved Games</h3>
      {savedGames.length === 0 ? (
        <p className={`text-center my-6 ${textColorClass}`}>No games saved yet.</p>
      ) : (
        <ul className={`space-y-3 max-h-60 sm:max-h-72 overflow-y-auto pr-2 pb-2 -mr-2 scrollbar-thin scrollbar-thumb-rounded-full ${theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50'}`}>
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