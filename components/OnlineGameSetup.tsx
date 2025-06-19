import React, { useState } from 'react';
import { OnlineGameState, PlayerColor, GameStatus, Theme } from '../types'; 
import { createInitialBoard, INITIAL_CASTLING_RIGHTS } from '../constants';
import { getOnlineGameState, setOnlineGameState } from '../utils/localStorageUtils';

interface OnlineGameSetupProps {
  onGameSetupComplete: (
    gameId: string, 
    isHost: boolean, 
    localPlayerName: string, 
    initialOnlineState: OnlineGameState
  ) => void;
  onBackToMenu: () => void; // This will reset to welcome arena
  theme: Theme; 
}

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const OnlineGameSetup: React.FC<OnlineGameSetupProps> = ({ onGameSetupComplete, onBackToMenu, theme }) => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [gameIdToJoin, setGameIdToJoin] = useState<string>('');
  const [createdGameId, setCreatedGameId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const panelBgClass = theme === 'dark' ? 'bg-slate-700/50 border-slate-600/50 shadow-black/40' : 'bg-white/70 border-gray-300/60 shadow-gray-400/30';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const titleShadowClass = theme === 'dark' ? '0 0 8px rgba(255,255,255,0.15)' : '0 0 8px rgba(0,0,0,0.1)';
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const errorColorClass = theme === 'dark' ? 'text-red-400' : 'text-red-600';
  
  const inputBaseClasses = "w-full p-3.5 rounded-lg border outline-none shadow-inner transition-all duration-200 ease-in-out backdrop-blur-sm text-base";
  const inputNormalClasses = `${inputBaseClasses} ${theme === 'dark' ? 'bg-slate-800/60 border-slate-600/70 placeholder-slate-400/80 text-slate-100 focus:ring-2 focus:ring-sky-400 focus:border-sky-400' : 'bg-gray-50/80 border-gray-400/70 placeholder-gray-500 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500'}`;
  
  const gameIdDisplayClasses = `text-center text-2xl font-mono tracking-wider select-all p-3 rounded-lg shadow-inner ${theme === 'dark' ? 'border-slate-600/70 bg-slate-800/70 text-yellow-300' : 'border-gray-400/60 bg-gray-100/80 text-yellow-700'}`;
  const copyButtonClasses = `p-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 ${theme === 'dark' ? 'bg-sky-600/80 hover:bg-sky-500/90 text-white focus-visible:ring-sky-400' : 'bg-sky-500 hover:bg-sky-600 text-white focus-visible:ring-sky-300'}`;
  
  const primaryButtonBase = `w-full font-semibold py-3.5 px-6 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed`;
  const getPrimaryButtonTheme = (action: 'create' | 'join' | 'start') => {
    if (theme === 'dark') {
      if (action === 'create') return 'bg-gradient-to-r from-green-500/90 via-emerald-600/90 to-teal-600/90 hover:from-green-500/95 hover:via-emerald-600/95 hover:to-teal-600/95 text-white focus-visible:ring-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/40';
      if (action === 'join') return 'bg-gradient-to-r from-sky-500/90 via-blue-600/90 to-indigo-600/90 hover:from-sky-500/95 hover:via-blue-600/95 hover:to-indigo-600/95 text-white focus-visible:ring-blue-400 shadow-blue-500/30 hover:shadow-blue-500/40';
      if (action === 'start') return 'bg-gradient-to-r from-lime-500/90 via-green-600/90 to-emerald-600/90 hover:from-lime-500/95 hover:via-green-600/95 hover:to-emerald-600/95 text-white focus-visible:ring-green-400 shadow-green-500/30 hover:shadow-green-500/40';
    } else { // Light theme
      if (action === 'create') return 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white focus-visible:ring-emerald-400 shadow-emerald-600/30 hover:shadow-emerald-600/40';
      if (action === 'join') return 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white focus-visible:ring-blue-400 shadow-blue-600/30 hover:shadow-blue-600/40';
      if (action === 'start') return 'bg-gradient-to-r from-lime-500 via-green-600 to-emerald-600 hover:from-lime-600 hover:via-green-700 hover:to-emerald-700 text-white focus-visible:ring-green-400 shadow-green-600/30 hover:shadow-green-600/40';
    }
    return '';
  }
  
  const secondaryButtonBase = `w-full text-sm py-3 rounded-lg transition-all duration-200 ease-in-out border hover:-translate-y-0.5 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-60 shadow-md hover:shadow-lg`;
  const backButtonClasses = `${secondaryButtonBase} ${theme === 'dark' ? 'text-slate-300 hover:text-white border-slate-600 hover:border-slate-500 bg-slate-700/60 hover:bg-slate-700/90 focus-visible:ring-slate-500' : 'text-slate-600 hover:text-slate-800 border-gray-400 hover:border-gray-500 bg-gray-200/80 hover:bg-gray-300/90 focus-visible:ring-gray-500'}`;
  const footerTextColor = theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500/80';


  const handleCreateGame = () => {
    if (!playerName.trim()) { setError('Please enter your name.'); return; }
    setError(''); setIsLoading(true);
    const newGameId = generateGameId(); setCreatedGameId(newGameId);
    const initialGameStatus: GameStatus = { message: `Game ${newGameId} created. Waiting for Player 2...`, isGameOver: false };
    const initialHostState: OnlineGameState = {
      boardState: createInitialBoard(), currentPlayer: PlayerColor.WHITE, castlingRights: INITIAL_CASTLING_RIGHTS,
      enPassantTarget: null, capturedByWhite: [], capturedByBlack: [], gameStatus: initialGameStatus,
      player1Name: playerName.trim(), player2Name: null, isGameReady: false, lastMoveBy: null, kingInCheckPosition: null,
    };
    setOnlineGameState(newGameId, initialHostState); setIsLoading(false); setCopied(false);
  };

  const proceedToHostGame = () => {
    const hostState = getOnlineGameState(createdGameId);
    if (hostState) onGameSetupComplete(createdGameId, true, hostState.player1Name, hostState);
    else setError("Error starting game. Please try creating again.");
  }

  const handleJoinGame = () => {
    if (!playerName.trim()) { setError('Please enter your name.'); return; }
    if (!gameIdToJoin.trim()) { setError('Please enter a Game ID to join.'); return; }
    setError(''); setIsLoading(true);
    const gameToJoinId = gameIdToJoin.trim().toUpperCase();
    const existingState = getOnlineGameState(gameToJoinId);
    if (existingState) {
      if (existingState.isGameReady && existingState.player2Name) {
        setError('This game is already full or has started.'); setIsLoading(false); return;
      }
      const updatedState: OnlineGameState = { ...existingState, player2Name: playerName.trim(), isGameReady: true,
        gameStatus: { ...existingState.gameStatus, message: `${playerName.trim()} joined. ${existingState.player1Name}'s turn.`}};
      setOnlineGameState(gameToJoinId, updatedState); setIsLoading(false);
      onGameSetupComplete(gameToJoinId, false, playerName.trim(), updatedState);
    } else { setError('Game ID not found. Please check the ID and try again.'); setIsLoading(false); }
  };
  
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } 
    catch (err) { alert('Failed to copy Game ID. Please copy it manually.'); }
  };

  if (createdGameId) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
        <div className={`backdrop-blur-xl shadow-2xl p-7 sm:p-10 rounded-xl max-w-md w-full text-center ${panelBgClass}`}>
            <h2 className={`text-2xl sm:text-3xl font-bold mb-5 ${titleColorClass}`} style={{textShadow: titleShadowClass}}>Game Created!</h2>
            <p className={`${textColorClass} mb-3 text-sm`}>Share this Game ID with your friend:</p>
            <div className="flex items-center justify-center space-x-3 my-5">
                <div className={`${gameIdDisplayClasses} flex-grow`}>{createdGameId}</div>
                <button onClick={() => copyToClipboard(createdGameId)} className={copyButtonClasses} title="Copy Game ID">
                    {copied ? 'Copied!' : '📋 Copy'}
                </button>
            </div>
            <p className={`text-xs sm:text-sm mb-7 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>You are Player 1 (White). Waiting for Player 2 to join...</p>
            <button onClick={proceedToHostGame} disabled={isLoading}
                className={`${primaryButtonBase} ${getPrimaryButtonTheme('start')}`}>
                {isLoading ? 'Starting...' : 'Start & Wait for Opponent'}
            </button>
             <button onClick={onBackToMenu} className={`${backButtonClasses} mt-5`}>Back to Main Menu</button>
        </div>
        <footer className={`absolute bottom-4 text-xs ${footerTextColor} select-none`}> <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p> </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
      <div className={`backdrop-blur-xl shadow-2xl p-7 sm:p-10 rounded-xl max-w-md w-full ${panelBgClass}`}>
        <h2 className={`text-2xl sm:text-3xl font-bold mb-8 text-center ${titleColorClass}`} style={{ textShadow: titleShadowClass}}>Play Online</h2>
        {!mode && (
          <div className="space-y-5">
            <button onClick={() => setMode('create')}
              className={`${primaryButtonBase} ${getPrimaryButtonTheme('create')}`}>
              Create New Game
            </button>
            <button onClick={() => setMode('join')}
              className={`${primaryButtonBase} ${getPrimaryButtonTheme('join')}`}>
              Join Existing Game
            </button>
            <button onClick={onBackToMenu} className={`${backButtonClasses} mt-6`}>Back to Main Menu</button>
          </div>
        )}
        {mode && (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <h3 className={`text-xl font-semibold text-center ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              {mode === 'create' ? 'Create Game' : 'Join Game'}
            </h3>
            <div>
              <label htmlFor="playerName" className={`block text-sm font-medium mb-1.5 ${textColorClass}`}>Your Name</label>
              <input type="text" id="playerName" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className={inputNormalClasses} maxLength={20} required placeholder="Enter your name"/>
            </div>
            {mode === 'join' && (
              <div>
                <label htmlFor="gameIdToJoin" className={`block text-sm font-medium mb-1.5 ${textColorClass}`}>Game ID</label>
                <input type="text" id="gameIdToJoin" value={gameIdToJoin} onChange={(e) => setGameIdToJoin(e.target.value.toUpperCase())} className={`${inputNormalClasses} uppercase`} maxLength={10} required placeholder="Enter Game ID from host"/>
              </div>
            )}
            {error && <p className={`${errorColorClass} text-sm text-center`}>{error}</p>}
            <button type="button" onClick={mode === 'create' ? handleCreateGame : handleJoinGame} disabled={isLoading}
              className={`${primaryButtonBase} ${getPrimaryButtonTheme(mode)}`}>
              {isLoading ? 'Processing...' : (mode === 'create' ? 'Create & Get ID' : 'Join Game')}
            </button>
            <button type="button" onClick={() => { setMode(null); setError(''); setCreatedGameId(''); setIsLoading(false); }} className={`${secondaryButtonBase} ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'}`}>
              Back
            </button>
          </form>
        )}
      </div>
      <footer className={`absolute bottom-4 text-xs ${footerTextColor} select-none`}> <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p> </footer>
    </div>
  );
};

export default OnlineGameSetup;