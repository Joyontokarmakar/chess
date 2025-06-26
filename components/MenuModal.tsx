import React, { useState } from 'react';
import { Theme, GameMode as AppGameMode, LayoutSettings, WelcomeArenaMenuItemId } from '../types'; // Renamed GameMode to avoid conflict
import ThemeToggle from './ThemeToggle';
import SavedGamesList from './SavedGamesList';
import type { SavedGame } from '../types';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onResetToMainMenu: (navigateToWelcomeArena?: boolean) => void;
  onSelectModeFromMenu: (mode: WelcomeArenaMenuItemId) => void; 
  onSaveCurrentGame?: () => void;
  canSaveGame: boolean;
  gameMode: AppGameMode | null; // Added gameMode prop
  
  savedGames: SavedGame[];
  onLoadSavedGame: (gameId: string) => void;
  onDeleteSavedGame: (gameId: string) => void;
  onClearAllSavedGames: () => void;
  
  layoutSettings: LayoutSettings;
  onLayoutSettingsChange: (settings: LayoutSettings) => void;
  onOpenLayoutCustomization: () => void;
  onOpenChessGuide: () => void;
  onOpenChangelog: () => void; // Added for Changelog
}

type MenuView = 'main' | 'savedGames' | 'gameSettings';


const MenuModal: React.FC<MenuModalProps> = ({ 
  isOpen, 
  onClose, 
  theme,
  onToggleTheme,
  onResetToMainMenu,
  onSelectModeFromMenu,
  onSaveCurrentGame,
  canSaveGame,
  gameMode, // Destructure gameMode
  savedGames,
  onLoadSavedGame,
  onDeleteSavedGame,
  onClearAllSavedGames,
  layoutSettings,
  onLayoutSettingsChange,
  onOpenLayoutCustomization,
  onOpenChessGuide,
  onOpenChangelog
}) => {
  const [menuView, setMenuView] = useState<MenuView>('main');

  if (!isOpen) return null;

  const menuContainerBg = theme === 'dark' ? 'bg-slate-800/85 backdrop-blur-2xl border-slate-700/60' : 'bg-white/85 backdrop-blur-2xl border-gray-300/60';
  const titleTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  
  const smallWideButtonBase = `w-full font-semibold py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 backdrop-blur-md border flex items-center justify-center gap-x-2`;
  const separatorClass = theme === 'dark' ? 'border-slate-700/80 my-3 sm:my-3.5' : 'border-gray-300/80 my-3 sm:my-3.5';
  const modeHeaderClass = `text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} my-1.5 text-center`;
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50';
  const settingsToggleContainerClass = `p-0 rounded-lg border-none ${theme === 'dark' ? 'bg-slate-700/60 border-slate-600/80' : 'bg-gray-200/80 border-gray-300/80'}`;


  const getButtonThemeClasses = (action: 'save' | 'load' | 'reset' | 'themeContainer' | 'close' | 'mode' | 'hof' | 'customize_layout' | 'chess_guide' | 'game_settings' | 'sound_toggle_container' | 'back_to_main' | 'puzzle_mode' | 'changelog' | 'coach_mode', baseColor?: string) => {
    const commonButtonStyles = `${smallWideButtonBase}`;
    if (theme === 'dark') {
      switch(action) {
        case 'save': 
        case 'load': 
            return `${commonButtonStyles} bg-green-600/70 hover:bg-green-500/80 border-green-500/50 text-white focus-visible:ring-green-400 disabled:bg-slate-600/50 disabled:border-slate-500/40 disabled:text-slate-400 disabled:hover:bg-slate-600/50 disabled:transform-none disabled:shadow-lg`;
        case 'reset': return `${commonButtonStyles} bg-amber-600/70 hover:bg-amber-500/80 border-amber-500/50 text-white focus-visible:ring-amber-400`;
        case 'customize_layout':
            return `${commonButtonStyles} bg-purple-600/70 hover:bg-purple-500/80 border-purple-500/50 text-white focus-visible:ring-purple-400`;
        case 'chess_guide':
        case 'changelog': 
            return `${commonButtonStyles} bg-indigo-600/70 hover:bg-indigo-500/80 border-indigo-500/50 text-white focus-visible:ring-indigo-400`;
        case 'game_settings':
            return `${commonButtonStyles} bg-cyan-600/70 hover:bg-cyan-500/80 border-cyan-500/50 text-white focus-visible:ring-cyan-400`;
        case 'puzzle_mode':
             return `${commonButtonStyles} bg-lime-600/70 hover:bg-lime-500/80 border-lime-500/50 text-white focus-visible:ring-lime-400`;
        case 'coach_mode':
             return `${commonButtonStyles} bg-indigo-600/70 hover:bg-indigo-500/80 border-indigo-500/50 text-white focus-visible:ring-indigo-400`; // Example color for Coach
        case 'themeContainer': 
        case 'sound_toggle_container':
            return `p-2.5 rounded-lg border bg-slate-700/60 border-slate-600/80`;
        case 'close': return `p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400`;
        case 'back_to_main':
            return `${commonButtonStyles} bg-slate-600/70 hover:bg-slate-500/80 border-slate-500/50 text-slate-200 focus-visible:ring-slate-400`;
        case 'mode':
        case 'hof':
            if (baseColor === 'friend') return `${commonButtonStyles} bg-teal-600/70 hover:bg-teal-500/80 border-teal-500/50 text-white focus-visible:ring-teal-400`;
            if (baseColor === 'computer') return `${commonButtonStyles} bg-rose-600/70 hover:bg-rose-500/80 border-rose-500/50 text-white focus-visible:ring-rose-400`;
            if (baseColor === 'online') return `${commonButtonStyles} bg-sky-600/70 hover:bg-sky-500/80 border-sky-500/50 text-white focus-visible:ring-sky-400`;
            if (baseColor === 'hof') return `${commonButtonStyles} bg-amber-600/70 hover:bg-amber-500/80 border-amber-500/50 text-white focus-visible:ring-amber-400`;
            return commonButtonStyles; 
      }
    } else { // Light theme
       switch(action) {
        case 'save':
        case 'load': 
            return `${commonButtonStyles} bg-green-500/80 hover:bg-green-600/90 border-green-400/60 text-white focus-visible:ring-green-500 disabled:bg-gray-300/70 disabled:border-gray-400/50 disabled:text-gray-500 disabled:hover:bg-gray-300/70 disabled:transform-none disabled:shadow-lg`;
        case 'reset': return `${commonButtonStyles} bg-amber-500/80 hover:bg-amber-600/90 border-amber-400/60 text-white focus-visible:ring-amber-500`;
        case 'customize_layout':
            return `${commonButtonStyles} bg-purple-500/80 hover:bg-purple-600/90 border-purple-400/60 text-white focus-visible:ring-purple-500`;
        case 'chess_guide':
        case 'changelog': 
            return `${commonButtonStyles} bg-indigo-500/80 hover:bg-indigo-600/90 border-indigo-400/60 text-white focus-visible:ring-indigo-500`;
        case 'game_settings':
            return `${commonButtonStyles} bg-cyan-500/80 hover:bg-cyan-600/90 border-cyan-400/60 text-white focus-visible:ring-cyan-500`;
        case 'puzzle_mode':
            return `${commonButtonStyles} bg-lime-500/80 hover:bg-lime-600/90 border-lime-400/60 text-white focus-visible:ring-lime-500`;
        case 'coach_mode':
            return `${commonButtonStyles} bg-indigo-500/80 hover:bg-indigo-600/90 border-indigo-400/60 text-white focus-visible:ring-indigo-500`; // Example for Coach
        case 'themeContainer': 
        case 'sound_toggle_container':
            return `p-2.5 rounded-lg border bg-gray-200/80 border-gray-300/80`;
        case 'close': return `p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600`;
        case 'back_to_main':
            return `${commonButtonStyles} bg-gray-300/80 hover:bg-gray-400/90 border-gray-400/60 text-slate-700 focus-visible:ring-gray-500`;
        case 'mode':
        case 'hof':
            if (baseColor === 'friend') return `${commonButtonStyles} bg-teal-500/80 hover:bg-teal-600/90 border-teal-400/60 text-white focus-visible:ring-teal-500`;
            if (baseColor === 'computer') return `${commonButtonStyles} bg-rose-500/80 hover:bg-rose-600/90 border-rose-400/60 text-white focus-visible:ring-rose-500`;
            if (baseColor === 'online') return `${commonButtonStyles} bg-sky-500/80 hover:bg-sky-600/90 border-sky-400/60 text-white focus-visible:ring-sky-500`;
            if (baseColor === 'hof') return `${commonButtonStyles} bg-amber-500/80 hover:bg-amber-600/90 border-amber-400/60 text-white focus-visible:ring-amber-500`;
            return commonButtonStyles; 
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

  const handleModeSelection = (mode: WelcomeArenaMenuItemId) => {
    onSelectModeFromMenu(mode);
    onClose();
  };

  const handleOpenLayoutCustomization = () => {
    onOpenLayoutCustomization();
  };

  const handleOpenChessGuide = () => {
    onOpenChessGuide();
    onClose(); 
  };
  
  const handleOpenChangelog = () => {
    onOpenChangelog();
  };

  const handleSoundToggle = () => {
    onLayoutSettingsChange({
      ...layoutSettings,
      isSoundEnabled: !layoutSettings.isSoundEnabled,
    });
  };
  
  const handleResignButtonToggle = () => {
    onLayoutSettingsChange({
      ...layoutSettings,
      showResignButton: !layoutSettings.showResignButton,
    });
  };

  const handleToastsToggle = () => {
    onLayoutSettingsChange({
      ...layoutSettings,
      showGameToasts: !layoutSettings.showGameToasts,
    });
  };

  const handleUndoButtonToggle = () => {
    onLayoutSettingsChange({
      ...layoutSettings,
      showUndoButton: !layoutSettings.showUndoButton,
    });
  };

  const handleHintButtonToggle = () => {
    onLayoutSettingsChange({
      ...layoutSettings,
      showHintButton: !layoutSettings.showHintButton,
    });
  };

  const handleOverlayClick = () => {
    setMenuView('main'); 
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(30, 41, 59, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className={`w-full max-w-xs sm:max-w-sm p-5 sm:p-6 rounded-2xl shadow-2xl ${menuContainerBg} ${titleTextColor} flex flex-col max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-5 sm:mb-6 flex-shrink-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${titleTextColor}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
            {menuView === 'main' ? 'Menu' : (menuView === 'savedGames' ? 'Saved Games' : 'Game Settings')}
          </h2>
          <button
            onClick={handleOverlayClick}
            className={getButtonThemeClasses('close', '')}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-grow overflow-y-auto scrollbar-thin ${scrollbarStyles} pr-1 -mr-3`}>
          {menuView === 'main' && (
            <div className="space-y-3 sm:space-y-3.5 pb-2 pr-2">
              <div className={settingsToggleContainerClass}>
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              </div>
              
              <button
                onClick={() => setMenuView('gameSettings')}
                className={getButtonThemeClasses('game_settings')}
                aria-label="Game Settings"
              >
                <span className="mr-2 text-lg">🛠️</span> Game Settings
              </button>
              <button
                onClick={() => handleModeSelection('hof')}
                className={getButtonThemeClasses('hof', 'hof')}
                aria-label="Hall of Fame"
              >
                <span className="mr-2 text-lg">🏆</span> Hall of Fame
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
                onClick={() => handleModeSelection('coach')}
                className={getButtonThemeClasses('coach_mode')}
                aria-label="Learn with Coach"
              >
                <span className="mr-2 text-lg">🧑‍🏫</span> Learn with Coach
              </button>
              <button
                onClick={() => handleModeSelection('online')}
                className={getButtonThemeClasses('mode', 'online')}
                aria-label="Play Online"
              >
                <span className="mr-2 text-lg">🌐</span> Play Online
              </button>
              <button
                onClick={() => handleModeSelection('puzzle')}
                className={getButtonThemeClasses('puzzle_mode')}
                aria-label="Puzzle Mode"
              >
                <span className="mr-2 text-lg">🧩</span> Puzzle Mode
              </button>

              <hr className={separatorClass} />
              
              {gameMode === 'friend' && (
                <button 
                  onClick={handleSaveGame}
                  className={getButtonThemeClasses('save', '')}
                  disabled={!canSaveGame} // canSaveGame is now more specific from App.tsx
                  aria-label="Save Current Game"
                >
                  <span className="mr-2 text-lg">💾</span> Save Current Game
                </button>
              )}
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
                onClick={handleOpenChangelog}
                className={getButtonThemeClasses('changelog', '')}
                aria-label="Game Updates"
              >
                <span className="mr-2 text-lg">📢</span> Game Updates
              </button>
              <button
                onClick={handleResetToMainMenu}
                className={getButtonThemeClasses('reset', '')}
                aria-label="Exit to Main Menu"
              >
                <span className="mr-2 text-lg">🚪</span> Exit to Main Menu
              </button>
            </div>
          )}

          {menuView === 'savedGames' && (
            <div className="pr-2">
              <SavedGamesList
                savedGames={savedGames}
                onLoadGame={handleLoadGameAndClose}
                onDeleteGame={onDeleteSavedGame}
                onClearAll={onClearAllSavedGames}
                onBack={() => setMenuView('main')}
                theme={theme}
              />
            </div>
          )}

          {menuView === 'gameSettings' && (
             <div className="space-y-3 sm:space-y-3.5 pb-2 pr-2">
                <button
                    onClick={handleOpenLayoutCustomization}
                    className={getButtonThemeClasses('customize_layout', '')}
                    aria-label="Customize Appearance"
                >
                    <span className="mr-2 text-lg">🎨</span> Customize Appearance
                </button>

                <div className={settingsToggleContainerClass}>
                    <div className="flex items-center justify-between w-full p-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Sounds: {layoutSettings.isSoundEnabled ? 'On' : 'Off'}
                        </span>
                        <input
                            type="checkbox"
                            id="sound-switch"
                            className="theme-switch-checkbox" 
                            checked={layoutSettings.isSoundEnabled}
                            onChange={handleSoundToggle}
                            aria-label="Toggle game sounds"
                        />
                        <label htmlFor="sound-switch" className="theme-switch-label"> 
                            <span className="theme-switch-icon">{layoutSettings.isSoundEnabled ? '🔊' : '🔇'}</span>
                            <span className="theme-switch-icon" style={{opacity:0}}>X</span> 
                            <span className="theme-switch-ball"></span>
                        </label>
                    </div>
                </div>

                <div className={settingsToggleContainerClass}>
                    <div className="flex items-center justify-between w-full p-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Resign Buttons: {layoutSettings.showResignButton ? 'On' : 'Off'}
                        </span>
                        <input
                            type="checkbox"
                            id="resign-button-switch"
                            className="theme-switch-checkbox" 
                            checked={layoutSettings.showResignButton}
                            onChange={handleResignButtonToggle}
                            aria-label="Toggle resign buttons"
                        />
                        <label htmlFor="resign-button-switch" className="theme-switch-label"> 
                            <span className="theme-switch-icon">{layoutSettings.showResignButton ? '🏳️' : '🚫'}</span>
                            <span className="theme-switch-icon" style={{opacity:0}}>X</span> 
                            <span className="theme-switch-ball"></span>
                        </label>
                    </div>
                </div>

                <div className={settingsToggleContainerClass}>
                    <div className="flex items-center justify-between w-full p-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Game Toasts: {layoutSettings.showGameToasts ? 'On' : 'Off'}
                        </span>
                        <input
                            type="checkbox"
                            id="toasts-switch"
                            className="theme-switch-checkbox" 
                            checked={layoutSettings.showGameToasts}
                            onChange={handleToastsToggle}
                            aria-label="Toggle game update toasts"
                        />
                        <label htmlFor="toasts-switch" className="theme-switch-label"> 
                            <span className="theme-switch-icon">{layoutSettings.showGameToasts ? '🔔' : '🔕'}</span>
                            <span className="theme-switch-icon" style={{opacity:0}}>X</span> 
                            <span className="theme-switch-ball"></span>
                        </label>
                    </div>
                </div>
                
                <div className={settingsToggleContainerClass}>
                    <div className="flex items-center justify-between w-full p-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Undo Button: {layoutSettings.showUndoButton ? 'On' : 'Off'}
                        </span>
                        <input
                            type="checkbox"
                            id="undo-button-switch"
                            className="theme-switch-checkbox" 
                            checked={layoutSettings.showUndoButton}
                            onChange={handleUndoButtonToggle}
                            aria-label="Toggle undo button"
                        />
                        <label htmlFor="undo-button-switch" className="theme-switch-label"> 
                            <span className="theme-switch-icon">↩️</span>
                            <span className="theme-switch-icon" style={{opacity:0}}>X</span> 
                            <span className="theme-switch-ball"></span>
                        </label>
                    </div>
                </div>

                <div className={settingsToggleContainerClass}>
                    <div className="flex items-center justify-between w-full p-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            Hint Button: {layoutSettings.showHintButton ? 'On' : 'Off'}
                        </span>
                        <input
                            type="checkbox"
                            id="hint-button-switch"
                            className="theme-switch-checkbox" 
                            checked={layoutSettings.showHintButton}
                            onChange={handleHintButtonToggle}
                            aria-label="Toggle hint button"
                        />
                        <label htmlFor="hint-button-switch" className="theme-switch-label"> 
                            <span className="theme-switch-icon">💡</span>
                            <span className="theme-switch-icon" style={{opacity:0}}>X</span> 
                            <span className="theme-switch-ball"></span>
                        </label>
                    </div>
                </div>
                
                <hr className={separatorClass} />

                <button
                    onClick={() => setMenuView('main')}
                    className={getButtonThemeClasses('back_to_main', '')}
                    aria-label="Back to Main Menu"
                >
                     <span className="mr-2 text-lg">↩️</span> Back to Main Menu
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuModal;