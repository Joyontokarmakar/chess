import React, { useState } from 'react';
import { GameMode, Theme } from '../types';
import { AI_PLAYER_NAME } from '../constants';

interface PlayerNameEntryProps {
  gameMode: GameMode;
  onSetupComplete: (player1Name: string, player2Name?: string) => void;
  onBackToMenu: () => void; // This will reset to welcome arena
  theme: Theme;
}

const PlayerNameEntry: React.FC<PlayerNameEntryProps> = ({ gameMode, onSetupComplete, onBackToMenu, theme }) => {
  const [p1Name, setP1Name] = useState<string>('Player 1');
  const [p2Name, setP2Name] = useState<string>('Player 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameMode === 'computer') {
      onSetupComplete(p1Name.trim() || "Player 1", AI_PLAYER_NAME);
    } else if (gameMode === 'friend') {
      onSetupComplete(p1Name.trim() || "Player 1", p2Name.trim() || "Player 2");
    }
  };
  
  const panelBgClass = theme === 'dark' ? 'bg-slate-700/50 border-slate-600/50 shadow-black/40' : 'bg-white/70 border-gray-300/60 shadow-gray-400/30';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const titleShadowClass = theme === 'dark' ? '0 0 8px rgba(255,255,255,0.15)' : '0 0 8px rgba(0,0,0,0.1)';
  
  const labelColorP1 = theme === 'dark' ? 'text-rose-400' : 'text-red-600';
  const labelColorP2 = theme === 'dark' ? 'text-cyan-400' : 'text-blue-600';
  
  const inputBaseClasses = "w-full p-3.5 rounded-lg border outline-none shadow-inner transition-all duration-200 ease-in-out backdrop-blur-sm text-base";
  const inputNormalClasses = `${inputBaseClasses} ${theme === 'dark' ? 'bg-slate-800/60 border-slate-600/70 placeholder-slate-400/80 text-slate-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400' : 'bg-gray-50/80 border-gray-400/70 placeholder-gray-500 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`;
  const inputDisabledClasses = `${inputBaseClasses} ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600/60 text-slate-400 cursor-not-allowed' : 'bg-gray-200/70 border-gray-400/60 text-gray-500 cursor-not-allowed'}`;
  
  const smallTextColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  
  const submitButtonClasses = `w-full font-semibold py-3.5 px-6 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 ${theme === 'dark' ? 'bg-gradient-to-r from-indigo-500/90 via-purple-600/90 to-pink-600/90 hover:from-indigo-500/95 hover:via-purple-600/95 hover:to-pink-600/95 text-white focus-visible:ring-purple-400 shadow-purple-500/30 hover:shadow-purple-500/40' : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white focus-visible:ring-purple-400 shadow-purple-600/30 hover:shadow-purple-600/40'}`;
  const backButtonClasses = `w-full text-sm py-3 mt-4 rounded-lg transition-all duration-200 ease-in-out border hover:-translate-y-0.5 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-60 shadow-md hover:shadow-lg ${theme === 'dark' ? 'text-slate-300 hover:text-white border-slate-600 hover:border-slate-500 bg-slate-700/60 hover:bg-slate-700/90 focus-visible:ring-slate-500' : 'text-slate-600 hover:text-slate-800 border-gray-400 hover:border-gray-500 bg-gray-200/80 hover:bg-gray-300/90 focus-visible:ring-gray-500'}`;
  
  const footerTextColor = theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500/80';

  if (gameMode === 'online') { 
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
            <p className={titleColorClass}>Redirecting to online game setup...</p>
             <footer className={`absolute bottom-4 text-xs ${footerTextColor} select-none`}>
                <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p>
            </footer>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
      <div className={`backdrop-blur-xl shadow-2xl p-7 sm:p-10 rounded-xl max-w-md w-full ${panelBgClass}`}>
        <h2 className={`text-2xl sm:text-3xl font-bold mb-8 text-center ${titleColorClass}`} style={{ textShadow: titleShadowClass}}>
          Enter Player Names
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="player1Name" className={`block text-sm font-semibold mb-1.5 ${labelColorP1}`}>
              Player 1 (White)
            </label>
            <input
              type="text"
              id="player1Name"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              className={inputNormalClasses}
              maxLength={20}
              placeholder="Enter P1 Name"
            />
          </div>

          {gameMode === 'friend' && (
            <div>
              <label htmlFor="player2Name" className={`block text-sm font-semibold mb-1.5 ${labelColorP2}`}>
                Player 2 (Black)
              </label>
              <input
                type="text"
                id="player2Name"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className={inputNormalClasses}
                maxLength={20}
                placeholder="Enter P2 Name"
              />
            </div>
          )}

          {gameMode === 'computer' && (
            <div>
              <label htmlFor="player2Name" className={`block text-sm font-semibold mb-1.5 ${labelColorP2}`}>
                Player 2 (Black)
              </label>
              <input
                type="text"
                id="player2Name"
                value={AI_PLAYER_NAME}
                disabled
                className={inputDisabledClasses}
              />
               <p className={`text-xs mt-1.5 ${smallTextColor}`}>You are playing against the AI.</p>
            </div>
          )}

          <button
            type="submit"
            className={submitButtonClasses}
            aria-label="Start Game"
          >
            Start Game
          </button>
           <button 
            type="button"
            onClick={onBackToMenu} // This now resets to Welcome Arena
            className={backButtonClasses}
            aria-label="Back to Main Menu"
            >
                Back to Main Menu
            </button>
        </form>
      </div>
      <footer className={`absolute bottom-4 text-xs ${footerTextColor} select-none`}>
        <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default PlayerNameEntry;