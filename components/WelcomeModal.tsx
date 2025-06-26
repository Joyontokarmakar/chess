import React from 'react';
import { Theme } from '../types';
import Logo from './Logo'; // Assuming Logo component can be reused

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) {
    return null;
  }

  const modalBgClass = theme === 'dark' ? 'bg-slate-800/80 backdrop-blur-2xl border-slate-700/60' : 'bg-white/80 backdrop-blur-2xl border-gray-300/60';
  const titleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-600';
  const textColorClass = theme === 'dark' ? 'text-slate-200' : 'text-slate-700';
  const overlayBgClass = theme === 'dark' ? 'bg-black/85 backdrop-blur-xl' : 'bg-black/70 backdrop-blur-lg';
  
  const buttonBaseClasses = `w-full sm:w-auto font-semibold py-3 px-7 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  
  const getStartedButtonThemeClass = theme === 'dark' 
    ? `bg-gradient-to-r from-green-500/90 via-emerald-600/90 to-teal-600/90 hover:from-green-500/95 hover:via-emerald-600/95 hover:to-teal-600/95 text-white focus-visible:ring-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/40`
    : `bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white focus-visible:ring-emerald-400 shadow-emerald-600/30 hover:shadow-emerald-600/40`;

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[90] p-4`} onClick={onClose}>
      <div 
        className={`w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl ${modalBgClass} flex flex-col items-center text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <Logo theme={theme} className={`w-20 h-20 sm:w-24 sm:h-24 mb-4 ${titleColorClass}`} />
        <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${titleColorClass}`}>
          Welcome to Classic Chess!
        </h2>
        <p className={`text-base sm:text-lg mb-2 ${textColorClass}`}>
          Ready to make your move?
        </p>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Challenge friends, test your skills against our AI, customize your game, and climb the Hall of Fame!
        </p>
        <ul className={`list-none text-left text-sm mb-6 space-y-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            <li><span className="font-semibold text-sky-400 dark:text-sky-300">Modes:</span> Play vs Friend, vs AI, Online (Simulated), or Puzzles.</li>
            <li><span className="font-semibold text-sky-400 dark:text-sky-300">Customize:</span> Choose board styles and piece colors.</li>
            <li><span className="font-semibold text-sky-400 dark:text-sky-300">Learn:</span> Use the in-game guide and hints.</li>
            <li><span className="font-semibold text-sky-400 dark:text-sky-300">Track:</span> Save games and celebrate wins in the Hall of Fame.</li>
        </ul>
        <button
          onClick={onClose}
          className={`${buttonBaseClasses} ${getStartedButtonThemeClass}`}
          aria-label="Get Started"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;