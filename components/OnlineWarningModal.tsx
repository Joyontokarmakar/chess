import React from 'react';
import { Theme } from '../types';

interface OnlineWarningModalProps {
  isOpen: boolean;
  onProceed: () => void;
  onCancel: () => void;
  theme: Theme;
}

const OnlineWarningModal: React.FC<OnlineWarningModalProps> = ({ isOpen, onProceed, onCancel, theme }) => {
  if (!isOpen) {
    return null;
  }

  const modalBgClass = theme === 'dark' ? 'bg-slate-700/60 backdrop-blur-2xl border-slate-600/50' : 'bg-white/70 backdrop-blur-2xl border-gray-300/50';
  const titleColorClass = theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600';
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';
  
  const buttonBaseClasses = `w-full sm:w-auto font-semibold py-3 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 min-w-[140px]`;
  
  const getButtonThemeClass = (type: 'primary' | 'secondary') => {
    if (theme === 'dark') {
      if (type === 'primary') return `bg-gradient-to-r from-sky-500/90 via-blue-600/90 to-indigo-600/90 hover:from-sky-500/95 hover:via-blue-600/95 hover:to-indigo-600/95 text-white focus-visible:ring-blue-400 shadow-blue-500/30 hover:shadow-blue-500/40`;
      if (type === 'secondary') return `bg-slate-600/80 hover:bg-slate-500/90 text-slate-200 border border-slate-500/70 focus-visible:ring-slate-400`;
    } else { // Light theme
      if (type === 'primary') return `bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white focus-visible:ring-blue-400 shadow-blue-600/30 hover:shadow-blue-600/40`;
      if (type === 'secondary') return `bg-gray-300/90 hover:bg-gray-400/95 text-slate-700 border border-gray-400/70 focus-visible:ring-gray-500`;
    }
    return '';
  };

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[60] p-4`} onClick={onCancel /* Allow closing by clicking overlay */}>
      <div 
        className={`w-full max-w-md p-6 sm:p-8 rounded-xl shadow-2xl ${modalBgClass} flex flex-col items-center text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`text-4xl mb-4 ${titleColorClass}`}>⚠️</div>
        <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${titleColorClass}`}>
          "Play Online" Notice
        </h2>
        <p className={`text-sm sm:text-base mb-6 ${textColorClass}`}>
          This "Play Online" mode is currently for <strong className={theme === 'dark' ? 'text-white' : 'text-black'}>same-device simulation only</strong>. 
          You can play by opening two browser tabs or windows. True multi-device play is not yet available. We are working on it. Please Stay with Us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={onProceed}
            className={`${buttonBaseClasses} ${getButtonThemeClass('primary')}`}
            aria-label="Proceed with same-device online play"
          >
            Proceed
          </button>
          <button
            onClick={onCancel}
            className={`${buttonBaseClasses} ${getButtonThemeClass('secondary')}`}
            aria-label="Cancel and go back"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineWarningModal;