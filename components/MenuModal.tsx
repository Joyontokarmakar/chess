
import React, { useState } from 'react';
import { Theme, GameMode as AppGameMode } from '../types'; // Renamed GameMode to avoid conflict
import ThemeToggle from './ThemeToggle';
import SavedGamesList from './SavedGamesList';
import type { SavedGame } from '../types';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onResetToMainMenu: (navigateToWelcomeArena?: boolean) => void;
  onSelectModeFromMenu: (mode: AppGameMode | 'hof') => void; // For mode buttons
  onSaveCurrentGame?: () => void;
  canSaveGame: boolean;
  
  savedGames: SavedGame[];
  onLoadSavedGame: (gameId: string) => void;
  onDeleteSavedGame: (gameId: string) => void;
  onClearAllSavedGames: () => void;
  onOpenLayoutCustomization: () => void;
  onOpenChessGuide: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ 
  isOpen, 
  onClose, 
  theme,
  onToggleTheme,
  onResetToMainMenu,
  onSelectModeFromMenu,
  onSaveCurrentGame,
  canSaveGame,
  savedGames,
  onLoadSavedGame,
  onDeleteSavedGame,
  onClearAllSavedGames,
  onOpenLayoutCustomization,
  onOpenChessGuide
}) => {
  const [menuView, setMenuView] = useState<'main' | 'savedGames'>('main');

  if (!isOpen) return null;

  const menuContainerBg = theme === 'dark' ? 'bg-slate-800/85 backdrop-blur-2xl border-slate-700/60' : 'bg-white/85 backdrop-blur-2xl border-gray-300/60';
  const titleTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  
  const smallWideButtonBase = `w-full font-semibold py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 backdrop-blur-md border flex items-center justify-center gap-x-2`;
  const separatorClass = theme === 'dark' ? 'border-slate-700/80 my-3 sm:my-3.5' : 'border-gray-300/80 my-3 sm:my-3.5';
  const modeHeaderClass = `text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} my-1.5 text-center`;

  const getButtonThemeClasses = (action: 'save' | 'load' | 'reset' | 'themeContainer' | 'close' | 'mode' | 'hof' | 'customize_layout' | 'chess_guide', baseColor?: string) => {
    if (theme === 'dark') {
      switch(action) {
        case 'save': 
        case 'load': 
            return `${smallWideButtonBase} bg-green-600/70 hover:bg-green-500/80 border-green-500/50 text-white focus-visible:ring-green-400 disabled:bg-slate-600/50 disabled:border-slate-500/40 disabled:text-slate-400 disabled:hover:bg-slate-600/50 disabled:transform-none disabled:shadow-lg`;
        case 'reset': return `${smallWideButtonBase} bg-amber-600/70 hover:bg-amber-500/80 border-amber-500/50 text-white focus-visible:ring-amber-400`;
        case 'customize_layout':
            return `${smallWideButtonBase} bg-purple-600/70 hover:bg-purple-500/80 border-purple-500/50 text-white focus-visible:ring-purple-400`;
        case 'chess_guide':
            return `${smallWideButtonBase} bg-indigo-600/70 hover:bg-indigo-500/80 border-indigo-500/50 text-white focus-visible:ring-indigo-400`;
        case 'themeContainer': return `p-2.5 rounded-lg border bg-slate-700/60 border-slate-600/80`;
        case 'close': return `p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400`;
        case 'mode':
        case 'hof':
            if (baseColor === 'friend') return `${smallWideButtonBase} bg-teal-600/70 hover:bg-teal-500/80 border-teal-500/50 text-white focus-visible:ring-teal-400`;
            if (baseColor === 'computer') return `${smallWideButtonBase} bg-rose-600/70 hover:bg-rose-500/80 border-rose-500/50 text-white focus-visible:ring-rose-400`;
            if (baseColor === 'online') return `${smallWideButtonBase} bg-sky-600/70 hover:bg-sky-500/80 border-sky-500/50 text-white focus-visible:ring-sky-400`;
            if (baseColor === 'hof') return `${smallWideButtonBase} bg-amber-600/70 hover:bg-amber-500/80 border-amber-500/50 text-white focus-visible:ring-amber-400`;
            return smallWideButtonBase; 
      }
    } else { // Light theme
       switch(action) {
        case 'save':
        case 'load': 
            return `${smallWideButtonBase} bg-green-500/80 hover:bg-green-600/90 border-green-400/60 text-white focus-visible:ring-green-500 disabled:bg-gray-300/70 disabled:border-gray-400/50 disabled:text-gray-500 disabled:hover:bg-gray-300/70 disabled:transform-none disabled:shadow-lg`;
        case 'reset': return `${smallWideButtonBase} bg-amber-500/80 hover:bg-amber-600/90 border-amber-400/60 text-white focus-visible:ring-amber-500`;
        case 'customize_layout':
            return `${smallWideButtonBase} bg-purple-500/80 hover:bg-purple-600/90 border-purple-400/60 text-white focus-visible:ring-purple-500`;
        case 'chess_guide':
            return `${smallWideButtonBase} bg-indigo-500/80 hover:bg-indigo-600/90 border-indigo-400/60 text-white focus-visible:ring-indigo-500`;
        case 'themeContainer': return `p-2.5 rounded-lg border bg-gray-200/80 border-gray-300/80`;
        case 'close': return `p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600`;
        case 'mode':
        case 'hof':
            if (baseColor === 'friend') return `${smallWideButtonBase} bg-teal-500/80 hover:bg-teal-600/90 border-teal-400/60 text-white focus-visible:ring-teal-500`;
            if (baseColor === 'computer') return `${smallWideButtonBase} bg-rose-500/80 hover:bg-rose-600/90 border-rose-400/60 text-white focus-visible:ring-rose-500`;
            if (baseColor === 'online') return `${smallWideButtonBase} bg-sky-500/80 hover:bg-sky-600/90 border-sky-400/60 text-white focus-visible:ring-sky-500`;
            if (baseColor === 'hof') return `${smallWideButtonBase} bg-amber-500/80 hover:bg-amber-600/90 border-amber-400/60 text-white focus-visible:ring-amber-500`;
            return smallWideButtonBase; 
      }
    }
    return '';
  };

  const handleSaveGame = () => {
    if (onSaveCurrentGame) {
      onSaveCurrentGame();
    }
  };
  
  const handleResetToMainMenu = () => {
      onResetToMainMenu(true); 
      onClose();
  }

  const handleLoadGameAndClose = (gameId: string) => {
    onLoadSavedGame(gameId);
    onClose();
  }

  const handleModeSelection = (mode: AppGameMode | 'hof') => {
    onSelectModeFromMenu(mode);
    onClose();
  };

  const handleOpenLayoutCustomization = () => {
    onOpenLayoutCustomization();
    // No need to onClose here as App.tsx will handle closing main menu when layout modal opens
  };

  const handleOpenChessGuide = () => {
    onOpenChessGuide();
    onClose(); 
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(30, 41, 59, 0.5)' }}
      onClick={() => { setMenuView('main'); onClose();}}
    >
      <div 
        className={`w-full max-w-xs sm:max-w-sm p-5 sm:p-6 rounded-2xl shadow-2xl ${menuContainerBg} ${titleTextColor} flex flex-col`}
        onClick={(e) => e.stopPropagation()} 
      >
        {menuView === 'main' && (
          <>
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className={`text-xl sm:text-2xl font-bold ${titleTextColor}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
                Menu
              </h2>
               
              <button
                onClick={() => { setMenuView('main'); onClose();}}
                className={getButtonThemeClasses('close', '')}
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={`my-3 sm:mt-6 p-0 rounded-lg border-none ${getButtonThemeClasses('themeContainer', '')}`}>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
            <div className="space-y-3 sm:space-y-3.5">
              <button
                onClick={() => handleModeSelection('hof')}
                className={getButtonThemeClasses('hof', 'hof')}
                aria-label="Hall of Fame"
              >
                <span className="mr-2 text-lg">🏆</span> Hall of Fame
              </button>
              <button
                onClick={handleOpenLayoutCustomization}
                className={getButtonThemeClasses('customize_layout', '')}
                aria-label="Customize Appearance"
              >
                <span className="mr-2 text-lg">🎨</span> Customize Appearance
              </button>
              
              <hr className={separatorClass} />
              
              <div className={modeHeaderClass}>Game Mode</div>

              <button
                onClick={() => handleModeSelection('friend')}
                className={getButtonThemeClasses('mode', 'friend')}
                aria-label="Play with Friend"
              >
                <span className="mr-2 text-lg">🧑‍🤝‍🧑</span> Play with Friend
              </button>
              <button
                onClick={() => handleModeSelection('computer')}
                className={getButtonThemeClasses('mode', 'computer')}
                aria-label="Play with AI"
              >
                <span className="mr-2 text-lg">🤖</span> Play with AI
              </button>
              <button
                onClick={() => handleModeSelection('online')}
                className={getButtonThemeClasses('mode', 'online')}
                aria-label="Play Online"
              >
                <span className="mr-2 text-lg">🌐</span> Play Online
              </button>

              <hr className={separatorClass} />
              
              <button 
                onClick={handleSaveGame}
                className={getButtonThemeClasses('save', '')}
                disabled={!canSaveGame}
                aria-label="Save Current Game"
              >
                <span className="mr-2 text-lg">💾</span> Save Current Game
              </button>
              <button 
                onClick={() => setMenuView('savedGames')}
                className={getButtonThemeClasses('load', '')}
                aria-label="Load Saved Games"
              >
                <span className="mr-2 text-lg">📂</span> Load Saved Games
              </button>
              
              <hr className={separatorClass} />
              
              <button
                onClick={handleOpenChessGuide}
                className={getButtonThemeClasses('chess_guide', '')}
                aria-label="Chess Guide"
              >
                <span className="mr-2 text-lg">📜</span> Chess Guide
              </button>
              <button
                onClick={handleResetToMainMenu}
                className={getButtonThemeClasses('reset', '')}
                aria-label="Exit to Main Menu"
              >
                <span className="mr-2 text-lg">🚪</span> Exit to Main Menu
              </button>
            </div>
            
            
          </>
        )}

        {menuView === 'savedGames' && (
          <SavedGamesList
            savedGames={savedGames}
            onLoadGame={handleLoadGameAndClose}
            onDeleteGame={onDeleteSavedGame}
            onClearAll={onClearAllSavedGames}
            onBack={() => setMenuView('main')}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

export default MenuModal;
