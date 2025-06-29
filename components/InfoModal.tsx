import React from 'react';
import { Theme } from '../types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  title: string;
  content: React.ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, theme, title, content }) => {
  if (!isOpen) return null;

  const modalBgClass = theme === 'dark' ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/70' : 'bg-white/90 backdrop-blur-xl border-gray-300/70';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const overlayBgClass = theme === 'dark' ? 'bg-black/70 backdrop-blur-lg' : 'bg-black/50 backdrop-blur-md';
  const buttonBase = `font-semibold py-2.5 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  const closeButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-gradient-to-r from-red-600/90 via-rose-700/90 to-pink-700/90 hover:from-red-600/95 hover:via-rose-700/95 hover:to-pink-700/95 text-white focus-visible:ring-rose-400 shadow-rose-500/30 hover:shadow-rose-500/40' : 'bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 hover:from-red-600 hover:via-rose-700 hover:to-pink-700 text-white focus-visible:ring-rose-400 shadow-rose-600/30 hover:shadow-rose-600/40'}`;
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50';

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[70] p-3 sm:p-4`} onClick={onClose}>
      <div 
        className={`w-full max-w-2xl p-5 sm:p-7 rounded-xl shadow-2xl ${modalBgClass} ${titleColorClass} flex flex-col max-h-[90vh] sm:max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600' }`}
            aria-label={`Close ${title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-grow overflow-y-auto pr-2 -mr-3 text-sm sm:text-base scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarStyles}`}>
          {content}
        </div>

        <div className={`mt-5 sm:mt-6 pt-4 border-t flex justify-center flex-shrink-0 ${theme === 'dark' ? 'border-slate-700/80' : 'border-gray-300/80'}`}>
          <button onClick={onClose} className={closeButtonClass}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;