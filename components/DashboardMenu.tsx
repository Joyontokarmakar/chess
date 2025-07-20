import React, { useState } from 'react';
import { Theme, GameMode as AppGameMode, LayoutSettings, WelcomeArenaMenuItemId } from '../types';
import ThemeToggle from './ThemeToggle';
import SavedGamesList from './SavedGamesList';
import type { SavedGame } from '../types';
import { FaUsers } from 'react-icons/fa';

interface DashboardMenuProps {
  theme: Theme;
  onToggleTheme: () => void;
  onResetToMainMenu: (navigateToWelcomeArena?: boolean) => void;
  onSelectModeFromMenu: (mode: WelcomeArenaMenuItemId) => void; 
  onSaveCurrentGame?: () => void;
  canSaveGame: boolean;
  gameMode: AppGameMode | null;
  savedGames: SavedGame[];
  onLoadSavedGame: (gameId: string) => void;
  onDeleteSavedGame: (gameId: string) => void;
  onClearAllSavedGames: () => void;
  layoutSettings: LayoutSettings;
  onLayoutSettingsChange: (settings: LayoutSettings) => void;
  onOpenLayoutCustomization: () => void;
  onOpenChessGuide: () => void;
  onOpenChangelog: () => void;
  onOpenGameHistory: () => void;
  isHistoryAvailable: boolean;
  visitorCount: number;
  onCloseMenu?: () => void; // Used to close the modal from within
}

type MenuView = 'main' | 'savedGames' | 'gameSettings';

const DashboardMenu: React.FC<DashboardMenuProps> = ({ 
  theme,
  onToggleTheme,
  onResetToMainMenu,
  onSelectModeFromMenu,
  onSaveCurrentGame,
  canSaveGame,
  gameMode,
  savedGames,
  onLoadSavedGame,
  onDeleteSavedGame,
  onClearAllSavedGames,
  layoutSettings,
  onLayoutSettingsChange,
  onOpenLayoutCustomization,
  onOpenChessGuide,
  onOpenChangelog,
  onOpenGameHistory,
  isHistoryAvailable,
  visitorCount,
  onCloseMenu,
}) => {
  const [menuView, setMenuView] = useState<MenuView>('main');

  const smallWideButtonBase = `w-full font-semibold py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 backdrop-blur-md border-transparent text-white flex items-center justify-center gap-x-2`;
  const separatorClass = theme === 'dark' ? 'border-slate-700/80 my-3 sm:my-3.5' : 'border-gray-300/80 my-3 sm:my-3.5';
  const modeHeaderClass = `text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} my-1.5 text-center`;
  const settingsToggleContainerClass = `p-0 rounded-lg border-none ${theme === 'dark' ? 'bg-slate-700/60 border-slate-600/80' : 'bg-gray-200/80 border-gray-300/80'}`;
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-transparent' : 'scrollbar-thumb-gray-400 scrollbar-track-transparent';

  const getButtonThemeClasses = (action: string, baseColor?: string) => {
    const commonButtonStyles = `${smallWideButtonBase}`;
    if (theme === 'dark') {
      switch(action) {
        case 'save': return `${commonButtonStyles} bg-gradient-to-r from-green-600/80 to-teal-700/80 hover:from-green-500/90 hover:to-teal-600/90 focus-visible:ring-green-400 disabled:bg-slate-700/60 disabled:from-slate-700/60 disabled:to-slate-700/60 disabled:text-slate-400 disabled:hover:from-slate-700/60 disabled:transform-none`;
        case 'load': return `${commonButtonStyles} bg-gradient-to-r from-purple-600/80 to-violet-700/80 hover:from-purple-500/90 hover:to-violet-600/90 focus-visible:ring-purple-400`;
        case 'reset': return `${commonButtonStyles} bg-gradient-to-r from-amber-600/80 to-red-700/80 hover:from-amber-500/90 hover:to-red-600/90 focus-visible:ring-amber-400`;
        case 'customize_layout': return `${commonButtonStyles} bg-gradient-to-r from-purple-600/80 to-violet-700/80 hover:from-purple-500/90 hover:to-violet-600/90 focus-visible:ring-purple-400`;
        case 'game_settings': return `${commonButtonStyles} bg-gradient-to-r from-cyan-600/80 to-sky-700/80 hover:from-cyan-500/90 hover:to-sky-600/90 focus-visible:ring-cyan-400`;
        case 'chess_guide': return `${commonButtonStyles} bg-gradient-to-r from-slate-500/80 to-sky-700/80 hover:from-slate-500/90 hover:to-sky-600/90 focus-visible:ring-slate-400`;
        case 'changelog': return `${commonButtonStyles} bg-gradient-to-r from-cyan-500/80 to-teal-600/80 hover:from-cyan-400/90 hover:to-teal-500/90 focus-visible:ring-cyan-400`;
        case 'puzzle_mode': return `${commonButtonStyles} bg-gradient-to-r from-lime-600/80 to-green-700/80 hover:from-lime-500/90 hover:to-green-600/90 focus-visible:ring-lime-400`;
        case 'coach_mode': return `${commonButtonStyles} bg-gradient-to-r from-indigo-500/80 to-purple-600/80 hover:from-indigo-500/90 hover:to-purple-500/90 focus-visible:ring-indigo-400`;
        case 'analyze_game': return `${commonButtonStyles} bg-gradient-to-r from-indigo-500/80 via-purple-600/80 to-pink-600/80 hover:from-indigo-500/90 hover:via-purple-600/90 hover:to-pink-600/90 focus-visible:ring-purple-400 disabled:bg-slate-700/60 disabled:from-slate-700/60 disabled:to-slate-700/60 disabled:text-slate-400 disabled:hover:from-slate-700/60 disabled:transform-none`;
        case 'back_to_main': return `${smallWideButtonBase} text-slate-200 bg-slate-600/70 hover:bg-slate-500/80 border-slate-500/50 focus-visible:ring-slate-400`;
        case 'mode':
        case 'hof':
            if (baseColor === 'friend') return `${commonButtonStyles} bg-gradient-to-r from-teal-600/80 to-green-700/80 hover:from-teal-500/90 hover:to-green-600/90 focus-visible:ring-teal-400`;
            if (baseColor === 'computer') return `${commonButtonStyles} bg-gradient-to-r from-rose-600/80 to-red-700/80 hover:from-rose-500/90 hover:to-red-600/90 focus-visible:ring-rose-400`;
            if (baseColor === 'online') return `${commonButtonStyles} bg-gradient-to-r from-sky-600/80 to-indigo-700/80 hover:from-sky-500/90 hover:to-indigo-600/90 focus-visible:ring-sky-400`;
            if (baseColor === 'hof') return `${commonButtonStyles} bg-gradient-to-r from-amber-500/80 to-orange-600/80 hover:from-amber-500/90 hover:to-orange-500/90 focus-visible:ring-amber-400`;
            return commonButtonStyles;
      }
    } else { // Light theme
       switch(action) {
        case 'save': return `${commonButtonStyles} bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus-visible:ring-green-500 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:hover:from-gray-300 disabled:transform-none`;
        case 'load': return `${commonButtonStyles} bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 focus-visible:ring-purple-500`;
        case 'reset': return `${commonButtonStyles} bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 focus-visible:ring-amber-500`;
        case 'customize_layout': return `${commonButtonStyles} bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 focus-visible:ring-purple-500`;
        case 'game_settings': return `${commonButtonStyles} bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 focus-visible:ring-cyan-500`;
        case 'chess_guide': return `${commonButtonStyles} bg-gradient-to-r from-slate-400 to-sky-500 hover:from-slate-500 hover:to-sky-600 focus-visible:ring-slate-500`;
        case 'changelog': return `${commonButtonStyles} bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-500 hover:to-teal-600 focus-visible:ring-cyan-500`;
        case 'puzzle_mode': return `${commonButtonStyles} bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 focus-visible:ring-lime-500`;
        case 'coach_mode': return `${commonButtonStyles} bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus-visible:ring-indigo-500`;
        case 'analyze_game': return `${commonButtonStyles} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus-visible:ring-purple-500 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:hover:from-gray-300 disabled:transform-none`;
        case 'back_to_main': return `${smallWideButtonBase} text-slate-700 bg-gray-300/80 hover:bg-gray-400/90 border-gray-400/60 focus-visible:ring-gray-500`;
        case 'mode':
        case 'hof':
            if (baseColor === 'friend') return `${commonButtonStyles} bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 focus-visible:ring-teal-500`;
            if (baseColor === 'computer') return `${commonButtonStyles} bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 focus-visible:ring-rose-500`;
            if (baseColor === 'online') return `${commonButtonStyles} bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus-visible:ring-sky-500`;
            if (baseColor === 'hof') return `${commonButtonStyles} bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 focus-visible:ring-amber-500`;
            return commonButtonStyles; 
      }
    }
    return '';
  };
  
  const handleActionAndClose = (action: () => void) => {
    action();
    if (onCloseMenu) onCloseMenu();
  };
  
  const handleSoundToggle = () => onLayoutSettingsChange({ ...layoutSettings, isSoundEnabled: !layoutSettings.isSoundEnabled });
  const handleResignButtonToggle = () => onLayoutSettingsChange({ ...layoutSettings, showResignButton: !layoutSettings.showResignButton });
  const handleToastsToggle = () => onLayoutSettingsChange({ ...layoutSettings, showGameToasts: !layoutSettings.showGameToasts });
  const handleUndoButtonToggle = () => onLayoutSettingsChange({ ...layoutSettings, showUndoButton: !layoutSettings.showUndoButton });
  const handleHintButtonToggle = () => onLayoutSettingsChange({ ...layoutSettings, showHintButton: !layoutSettings.showHintButton });

  const visitorCountTextColor = theme === 'dark' ? 'text-green-300' : 'text-green-600';
  const visitorCountContainerBg = theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-300/40';

  let menuContent;
  if (menuView === 'main') {
    menuContent = (
        <div className="space-y-3 sm:space-y-3.5 pb-2">
            <div className={settingsToggleContainerClass}><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
            <button onClick={() => setMenuView('gameSettings')} className={getButtonThemeClasses('game_settings')}><span className="mr-2 text-lg">🛠️</span> Game Settings</button>
            <button onClick={() => handleActionAndClose(() => onSelectModeFromMenu('hof'))} className={getButtonThemeClasses('hof', 'hof')}><span className="mr-2 text-lg">🏆</span> Hall of Fame</button>
            <hr className={separatorClass} />
            <div className={modeHeaderClass}>Post-Game</div>
            <button onClick={() => handleActionAndClose(onOpenGameHistory)} disabled={!isHistoryAvailable} className={getButtonThemeClasses('analyze_game')}><span className="mr-2 text-lg">📊</span> Game History & Analysis</button>
            <hr className={separatorClass} />
            <div className={modeHeaderClass}>Game Mode</div>
            <button onClick={() => handleActionAndClose(() => onSelectModeFromMenu('friend'))} className={getButtonThemeClasses('mode', 'friend')}><span className="mr-2 text-lg">🧑‍🤝‍🧑</span> Play with Friend</button>
            <button onClick={() => handleActionAndClose(() => onSelectModeFromMenu('computer'))} className={getButtonThemeClasses('mode', 'computer')}><span className="mr-2 text-lg">🤖</span> Play with AI</button>
            <button onClick={() => handleActionAndClose(() => onSelectModeFromMenu('coach'))} className={getButtonThemeClasses('coach_mode')}><span className="mr-2 text-lg">🧑‍🏫</span> Learn with Coach</button>
            <button onClick={() => handleActionAndClose(() => onSelectModeFromMenu('online'))} className={getButtonThemeClasses('mode', 'online')}><span className="mr-2 text-lg">🌐</span> Play Online</button>
            <button onClick={() => handleActionAndClose(() => onSelectModeFromMenu('puzzle'))} className={getButtonThemeClasses('puzzle_mode')}><span className="mr-2 text-lg">🧩</span> Puzzle Mode</button>
            <hr className={separatorClass} />
            {gameMode === 'friend' && <button onClick={onSaveCurrentGame} className={getButtonThemeClasses('save')} disabled={!canSaveGame}><span className="mr-2 text-lg">💾</span> Save Current Game</button>}
            <button onClick={() => setMenuView('savedGames')} className={getButtonThemeClasses('load')}><span className="mr-2 text-lg">📂</span> Load Saved Games</button>
            <hr className={separatorClass} />
            <button onClick={() => handleActionAndClose(onOpenChessGuide)} className={getButtonThemeClasses('chess_guide')}><span className="mr-2 text-lg">📜</span> Chess Guide</button>
            <button onClick={() => handleActionAndClose(onOpenChangelog)} className={getButtonThemeClasses('changelog')}><span className="mr-2 text-lg">📢</span> Game Updates</button>
            <button onClick={() => handleActionAndClose(() => onResetToMainMenu(true))} className={getButtonThemeClasses('reset')}><span className="mr-2 text-lg">🚪</span> Exit to Main Menu</button>
        </div>
    );
  } else if (menuView === 'savedGames') {
    menuContent = (
        <SavedGamesList
            savedGames={savedGames}
            onLoadGame={(id) => handleActionAndClose(() => onLoadSavedGame(id))}
            onDeleteGame={onDeleteSavedGame}
            onClearAll={onClearAllSavedGames}
            onBack={() => setMenuView('main')}
            theme={theme}
        />
    );
  } else if (menuView === 'gameSettings') {
    menuContent = (
        <div className="space-y-3 sm:space-y-3.5 pb-2">
            <button onClick={() => handleActionAndClose(onOpenLayoutCustomization)} className={getButtonThemeClasses('customize_layout')} aria-label="Customize Appearance">
                <span className="mr-2 text-lg">🎨</span> Customize Appearance
            </button>
            <div className={settingsToggleContainerClass}><div className="flex items-center justify-between w-full p-2"><span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Sounds: {layoutSettings.isSoundEnabled ? 'On' : 'Off'}</span><input type="checkbox" id="sound-switch-dash" className="theme-switch-checkbox" checked={layoutSettings.isSoundEnabled} onChange={handleSoundToggle} aria-label="Toggle game sounds" /><label htmlFor="sound-switch-dash" className="theme-switch-label"><span className="theme-switch-icon">{layoutSettings.isSoundEnabled ? '🔊' : '🔇'}</span><span className="theme-switch-icon" style={{opacity:0}}>X</span><span className="theme-switch-ball"></span></label></div></div>
            <div className={settingsToggleContainerClass}><div className="flex items-center justify-between w-full p-2"><span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Resign Buttons: {layoutSettings.showResignButton ? 'On' : 'Off'}</span><input type="checkbox" id="resign-button-switch-dash" className="theme-switch-checkbox" checked={layoutSettings.showResignButton} onChange={handleResignButtonToggle} aria-label="Toggle resign buttons" /><label htmlFor="resign-button-switch-dash" className="theme-switch-label"><span className="theme-switch-icon">{layoutSettings.showResignButton ? '🏳️' : '🚫'}</span><span className="theme-switch-icon" style={{opacity:0}}>X</span><span className="theme-switch-ball"></span></label></div></div>
            <div className={settingsToggleContainerClass}><div className="flex items-center justify-between w-full p-2"><span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Game Toasts: {layoutSettings.showGameToasts ? 'On' : 'Off'}</span><input type="checkbox" id="toasts-switch-dash" className="theme-switch-checkbox" checked={layoutSettings.showGameToasts} onChange={handleToastsToggle} aria-label="Toggle game update toasts" /><label htmlFor="toasts-switch-dash" className="theme-switch-label"><span className="theme-switch-icon">{layoutSettings.showGameToasts ? '🔔' : '🔕'}</span><span className="theme-switch-icon" style={{opacity:0}}>X</span><span className="theme-switch-ball"></span></label></div></div>
            <div className={settingsToggleContainerClass}><div className="flex items-center justify-between w-full p-2"><span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Undo Button: {layoutSettings.showUndoButton ? 'On' : 'Off'}</span><input type="checkbox" id="undo-button-switch-dash" className="theme-switch-checkbox" checked={layoutSettings.showUndoButton} onChange={handleUndoButtonToggle} aria-label="Toggle undo button" /><label htmlFor="undo-button-switch-dash" className="theme-switch-label"><span className="theme-switch-icon">↩️</span><span className="theme-switch-icon" style={{opacity:0}}>X</span><span className="theme-switch-ball"></span></label></div></div>
            <div className={settingsToggleContainerClass}><div className="flex items-center justify-between w-full p-2"><span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Hint Button: {layoutSettings.showHintButton ? 'On' : 'Off'}</span><input type="checkbox" id="hint-button-switch-dash" className="theme-switch-checkbox" checked={layoutSettings.showHintButton} onChange={handleHintButtonToggle} aria-label="Toggle hint button" /><label htmlFor="hint-button-switch-dash" className="theme-switch-label"><span className="theme-switch-icon">💡</span><span className="theme-switch-icon" style={{opacity:0}}>X</span><span className="theme-switch-ball"></span></label></div></div>
            <hr className={separatorClass} />
            <button onClick={() => setMenuView('main')} className={getButtonThemeClasses('back_to_main')} aria-label="Back to Main Menu"><span className="mr-2 text-lg">↩️</span> Back to Main Menu</button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className={`flex-grow overflow-y-auto pr-2 -mr-3 scrollbar-thin scrollbar-thumb-rounded-full ${scrollbarStyles}`}>
            {menuContent}
        </div>
        <div className="flex-shrink-0 mt-auto pt-3 border-t border-slate-700/50">
            <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${visitorCountContainerBg}`}>
                <FaUsers className={`w-5 h-5 ${visitorCountTextColor}`} />
                <span className={`font-semibold ${visitorCountTextColor}`}>
                    {visitorCount.toLocaleString()}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total Visitors
                </span>
            </div>
        </div>
    </div>
  );
};

export default DashboardMenu;