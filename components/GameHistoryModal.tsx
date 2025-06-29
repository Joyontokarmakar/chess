import React from 'react';
import { CompletedGame, Theme, GameOverReason } from '../types';

interface GameHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  games: CompletedGame[];
  onAnalyze: (game: CompletedGame) => void;
  onClearHistory: () => void;
}

const formatGameDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatDuration = (seconds: number | null) => {
  if (seconds === null) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatResult = (result: CompletedGame['result']) => {
  if (result.winnerName) {
    let reasonText = '';
    switch (result.reason) {
      case 'checkmate': reasonText = 'by Checkmate'; break;
      case 'resignation': reasonText = 'by Resignation'; break;
      case 'timeout': reasonText = 'on Time'; break;
      default: reasonText = '';
    }
    return `Win ${reasonText}`;
  }
  if (result.reason === 'stalemate') return 'Draw by Stalemate';
  return 'Draw';
};

const GameHistoryModal: React.FC<GameHistoryModalProps> = ({ isOpen, onClose, theme, games, onAnalyze, onClearHistory }) => {
  if (!isOpen) return null;

  const modalBgClass = theme === 'dark' ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/70' : 'bg-white/90 backdrop-blur-xl border-gray-300/70';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const textColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';
  const itemBgClass = theme === 'dark' ? 'bg-slate-700/60 border-slate-600/50' : 'bg-gray-100/70 border-gray-300/60';
  const itemHoverBgClass = theme === 'dark' ? 'hover:bg-slate-700/80' : 'hover:bg-gray-200/80';
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50';

  const buttonBase = "font-semibold py-2 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed";
  const analyzeButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-sky-600/80 hover:bg-sky-500/90 text-white focus-visible:ring-sky-400' : 'bg-sky-500 hover:bg-sky-600 text-white focus-visible:ring-sky-300'}`;
  const clearButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-red-700/80 hover:bg-red-600/90 text-white focus-visible:ring-red-400' : 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-400'}`;
  const closeButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-slate-600/70 hover:bg-slate-500/80 text-slate-200 focus-visible:ring-slate-400' : 'bg-gray-300/80 hover:bg-gray-400/90 text-slate-700 focus-visible:ring-gray-500'}`;
  
  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[70] p-4`} onClick={onClose}>
      <div 
        className={`w-full max-w-lg p-5 sm:p-7 rounded-xl shadow-2xl ${modalBgClass} ${titleColorClass} flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 sm:mb-6 flex-shrink-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
            Game History
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600' }`}
            aria-label="Close game history"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-grow overflow-y-auto pr-2 -mr-3 space-y-3 scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarStyles}`}>
          {games.length === 0 ? (
            <p className={`text-center my-8 ${textColor}`}>No completed games found.</p>
          ) : (
            games.map(game => (
              <div key={game.id} className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-150 ${itemBgClass} ${itemHoverBgClass}`}>
                <div className="flex-grow">
                  <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {game.player1Name} vs {game.player2Name}
                  </p>
                  <p className={`text-xs ${textColor}`}>
                    <span className="font-medium">{formatResult(game.result)}</span> - {formatGameDate(game.gameStartDate)} ({formatDuration(game.durationSeconds)})
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button onClick={() => { onAnalyze(game); onClose(); }} className={analyzeButtonClass}>
                    Analyze
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row sm:justify-between items-center gap-3 ${theme === 'dark' ? 'border-slate-700/80' : 'border-gray-300/80'}`}>
          <button onClick={onClose} className={`${closeButtonClass} order-2 sm:order-1`}>
            Close
          </button>
          {games.length > 0 && (
            <button onClick={onClearHistory} className={`${clearButtonClass} order-1 sm:order-2`}>
              Clear History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistoryModal;