
import React from 'react';
import { Theme } from '../types';

interface ResignConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  resigningPlayerName: string;
  winningPlayerName: string;
  theme: Theme;
}

const ResignConfirmationModal: React.FC<ResignConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  resigningPlayerName,
  winningPlayerName,
  theme,
}) => {
  if (!isOpen) {
    return null;
  }

  const modalBgClass = theme === 'dark' ? 'bg-slate-700/60 backdrop-blur-2xl border-slate-600/50' : 'bg-white/70 backdrop-blur-2xl border-gray-300/50';
  const titleColorClass = theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600';
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';
  
  const buttonBaseClasses = `w-full sm:w-auto font-semibold py-3 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 min-w-[160px]`;
  
  const confirmButtonThemeClass = theme === 'dark' 
    ? `bg-gradient-to-r from-red-600/90 via-rose-700/90 to-pink-700/90 hover:from-red-600/95 hover:via-rose-700/95 hover:to-pink-700/95 text-white focus-visible:ring-rose-400 shadow-rose-500/30 hover:shadow-rose-500/40`
    : `bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 hover:from-red-600 hover:via-rose-700 hover:to-pink-700 text-white focus-visible:ring-rose-400 shadow-rose-600/30 hover:shadow-rose-600/40`;
  
  const cancelButtonThemeClass = theme === 'dark'
    ? `bg-slate-600/80 hover:bg-slate-500/90 text-slate-200 border border-slate-500/70 focus-visible:ring-slate-400`
    : `bg-gray-300/90 hover:bg-gray-400/95 text-slate-700 border border-gray-400/70 focus-visible:ring-gray-500`;

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[65] p-4`} onClick={onCancel}>
      <div 
        className={`w-full max-w-md p-6 sm:p-8 rounded-xl shadow-2xl ${modalBgClass} flex flex-col items-center text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`text-4xl mb-4 ${titleColorClass}`}>🏳️</div>
        <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${titleColorClass}`}>
          Confirm Resignation
        </h2>
        <p className={`text-sm sm:text-base mb-6 ${textColorClass}`}>
          {resigningPlayerName}, are you sure you want to resign? 
          <br />
          <strong className={theme === 'dark' ? 'text-white' : 'text-black'}>{winningPlayerName}</strong> will be declared the winner.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={onConfirm}
            className={`${buttonBaseClasses} ${confirmButtonThemeClass}`}
            aria-label="Confirm resignation"
          >
            Confirm Resignation
          </button>
          <button
            onClick={onCancel}
            className={`${buttonBaseClasses} ${cancelButtonThemeClass}`}
            aria-label="Cancel resignation"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResignConfirmationModal;
