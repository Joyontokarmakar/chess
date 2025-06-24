

import React, { useState, useEffect } from 'react';
import { HallOfFameEntry, Theme, GameOverReason } from '../types'; 
import { getHallOfFameEntries, clearHallOfFame as clearStoredHallOfFame } from '../utils/localStorageUtils';

interface HallOfFameProps {
  onBackToMenu: () => void;
  theme: Theme; 
}

const formatPlayDuration = (durationSeconds: number | null): string => {
  if (durationSeconds === null || durationSeconds < 0) return 'N/A';
  const totalSeconds = Math.round(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`); // Show minutes if hours or minutes exist
  parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0s';
};

const formatGameStartDateTime = (isoDateTime: string): string => {
  try {
    const date = new Date(isoDateTime);
    return date.toLocaleString(undefined, { 
      year: 'numeric', month: 'numeric', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatWinReason = (reason?: GameOverReason | 'draw'): string => {
  if (!reason) return 'Finished';
  switch (reason) {
    case 'checkmate': return 'Checkmate';
    case 'stalemate': return 'Stalemate';
    case 'timeout': return 'Timeout';
    case 'resignation': return 'Resignation';
    case 'draw': return 'Draw';
    default: 
      // If reason is a string not covered above, format it.
      // This handles potential future extensions to GameOverReason.
      const reasonStr = reason as string;
      return reasonStr.charAt(0).toUpperCase() + reasonStr.slice(1);
  }
};


const HallOfFame: React.FC<HallOfFameProps> = ({ onBackToMenu, theme }) => {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);

  useEffect(() => {
    setEntries(getHallOfFameEntries());
  }, []);

  const handleClearHallOfFame = () => {
    if (window.confirm("Are you sure you want to clear the Hall of Fame? This cannot be undone.")) {
        clearStoredHallOfFame();
        setEntries([]); 
    }
  };

  const panelBgClass = theme === 'dark' ? 'bg-slate-700/50 border-slate-600/50 shadow-black/40' : 'bg-white/70 border-gray-300/60 shadow-gray-400/30';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const titleShadowClass = theme === 'dark' ? '0 0 10px rgba(255,215,0,0.4)' : '0 0 8px rgba(200,150,0,0.25)';
  const emptyTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  
  const tableContainerBorderClass = theme === 'dark' ? 'border-slate-600/60 shadow-black/30' : 'border-gray-400/50 shadow-gray-500/20';
  const tableHeaderBgClass = theme === 'dark' ? 'bg-slate-800/60 backdrop-blur-lg' : 'bg-gray-200/70 backdrop-blur-lg';
  const tableHeaderTextColor = theme === 'dark' ? 'text-amber-300' : 'text-amber-700';
  const tableDivideClass = theme === 'dark' ? 'divide-slate-700/70' : 'divide-gray-300/70';
  const tableRowHoverBgClass = theme === 'dark' ? 'hover:bg-slate-600/50' : 'hover:bg-gray-200/60';

  const getRowBgClass = (index: number) => {
    if (theme === 'dark') {
      return index === 0 ? 'bg-yellow-600/30 backdrop-blur-md' : (index % 2 === 0 ? 'bg-slate-700/40 backdrop-blur-sm' : 'bg-slate-750/30 backdrop-blur-sm');
    }
    return index === 0 ? 'bg-yellow-200/60 backdrop-blur-md' : (index % 2 === 0 ? 'bg-gray-100/60 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm');
  };
  const getRowRankColor = (index: number) => theme === 'dark' ? (index === 0 ? 'text-yellow-300 font-bold' : 'text-slate-200') : (index === 0 ? 'text-yellow-700 font-bold' : 'text-slate-700');
  const getRowWinnerColor = (index: number) => theme === 'dark' ? (index === 0 ? 'text-yellow-200 font-semibold' : 'text-slate-300') : (index === 0 ? 'text-yellow-600 font-bold' : 'text-slate-700');
  const getRowOtherTextColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';


  const primaryButtonBaseClasses = `w-full sm:w-auto font-semibold py-3 px-7 rounded-lg text-base shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 text-white`;
  const backButtonThemeClass = theme === 'dark' ? 'bg-gradient-to-r from-teal-500/90 via-cyan-600/90 to-sky-600/90 hover:from-teal-500/95 hover:via-cyan-600/95 hover:to-sky-600/95 focus-visible:ring-cyan-400 shadow-cyan-500/30 hover:shadow-cyan-500/40' : 'bg-gradient-to-r from-teal-500 via-cyan-600 to-sky-600 hover:from-teal-600 hover:via-cyan-700 hover:to-sky-700 focus-visible:ring-cyan-400 shadow-cyan-600/30 hover:shadow-cyan-600/40';
  const clearButtonThemeClass = theme === 'dark' ? 'bg-gradient-to-r from-red-600/90 via-rose-700/90 to-pink-700/90 hover:from-red-600/95 hover:via-rose-700/95 hover:to-pink-700/95 focus-visible:ring-rose-400 shadow-rose-500/30 hover:shadow-rose-500/40' : 'bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 hover:from-red-600 hover:via-rose-700 hover:to-pink-700 focus-visible:ring-rose-400 shadow-rose-600/30 hover:shadow-rose-600/40';
  const footerTextColor = theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500/80';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
      <div className={`backdrop-blur-xl shadow-2xl p-6 sm:p-8 rounded-xl w-full max-w-4xl ${panelBgClass}`}>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-7 sm:mb-9 text-center ${titleColorClass}`} style={{ textShadow: titleShadowClass}}>
            🏆 Hall of Fame 🏆
        </h1>

        {entries.length === 0 ? (
          <p className={`text-center text-lg my-10 ${emptyTextColor}`}>No champions recorded yet. Play a game to make history!</p>
        ) : (
          <div className={`overflow-x-auto rounded-lg border shadow-inner ${tableContainerBorderClass}`}>
            <table className={`min-w-full divide-y ${tableDivideClass}`}>
              <thead className={tableHeaderBgClass}>
                <tr>
                  {['Rank', 'Winner', 'Opponent', 'Mode', 'Date & Time', 'Duration', 'Result'].map(header => (
                    <th key={header} className={`px-4 py-3.5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider ${tableHeaderTextColor}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${tableDivideClass}`}>
                {entries.map((entry, index) => (
                  <tr 
                    key={entry.id} 
                    className={`${getRowBgClass(index)} ${tableRowHoverBgClass} transition-colors duration-150`}
                  >
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getRowRankColor(index)}`}>{index + 1}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${getRowWinnerColor(index)}`}>{entry.winnerName}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${getRowOtherTextColor}`}>{entry.opponentName}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${getRowOtherTextColor} capitalize`}>{entry.mode === 'computer' ? 'vs AI' : (entry.mode === 'loaded_friend' ? 'Loaded' : entry.mode)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-xs ${getRowOtherTextColor}`}>{formatGameStartDateTime(entry.gameStartDateTime)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-xs ${getRowOtherTextColor}`}>{formatPlayDuration(entry.playDurationSeconds)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-xs font-medium ${getRowOtherTextColor}`}>{formatWinReason(entry.winReason)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 sm:gap-6">
          <button
            onClick={onBackToMenu}
            className={`${primaryButtonBaseClasses} order-2 sm:order-1 ${backButtonThemeClass}`}
          >
            Back to Main Menu
          </button>
          {entries.length > 0 && (
            <button
              onClick={handleClearHallOfFame}
              className={`${primaryButtonBaseClasses} order-1 sm:order-2 ${clearButtonThemeClass}`}
            >
              Clear Hall of Fame
            </button>
          )}
        </div>
      </div>
      <footer className={`absolute bottom-4 text-xs ${footerTextColor} select-none`}>
        <p>{'©'} 2025 Joyonto Karmakar. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HallOfFame;