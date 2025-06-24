import React, { useEffect, useState } from 'react';
import { GameStatus, Theme, PlayerColor } from '../types';

interface GameOverOverlayProps {
  gameStatus: GameStatus;
  theme: Theme;
  onPlayAgain: () => void;
  player1Name: string;
  player2Name: string;
}

const ConfettiPiece: React.FC<{ theme: Theme }> = ({ theme }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const x = Math.random() * 100; // %
    const y = Math.random() * 100; // %
    const rotation = Math.random() * 360; // degrees
    const size = Math.random() * 8 + 6; // px
    const duration = Math.random() * 2 + 3; // seconds
    const delay = Math.random() * 1.5; // seconds

    // Theme-based confetti colors
    const darkThemeColors = ['#FBBF24', '#F87171', '#60A5FA', '#34D399', '#A78BFA']; // amber, red, blue, green, violet
    const lightThemeColors = ['#F9A8D4', '#FCA5A5', '#93C5FD', '#6EE7B7', '#C4B5FD'];// pink, light red, light blue, light green, light violet
    
    const colors = theme === 'dark' ? darkThemeColors : lightThemeColors;
    const color = colors[Math.floor(Math.random() * colors.length)];

    setStyle({
      left: `${x}%`,
      top: `${y - 10}%`, // Start slightly above
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      transform: `rotate(${rotation}deg)`,
      animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
      position: 'absolute',
      opacity: 0.9,
      borderRadius: '2px',
    });
  }, [theme]);

  return <div style={style} className="confetti-piece"></div>;
};

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ gameStatus, theme, onPlayAgain, player1Name, player2Name }) => {
  if (!gameStatus.isGameOver) {
    return null;
  }

  const numConfetti = 100;

  let message = "Game Over!";
  let subMessage = "";

  if (gameStatus.winner) {
    const winnerDisplayName = gameStatus.winner === PlayerColor.WHITE ? player1Name : player2Name;
    message = `${winnerDisplayName} Wins!`;
    switch (gameStatus.reason) {
      case 'checkmate':
        subMessage = `By Checkmate. Brilliant strategy!`;
        break;
      case 'resignation':
        const loserDisplayName = gameStatus.winner === PlayerColor.WHITE ? player2Name : player1Name;
        subMessage = `${loserDisplayName} resigned.`;
        break;
      case 'timeout':
         const timedOutPlayer = gameStatus.winner === PlayerColor.WHITE ? player2Name : player1Name;
        subMessage = `${timedOutPlayer}'s time ran out.`;
        break;
      default:
        subMessage = "Congratulations!";
    }
  } else if (gameStatus.reason === 'stalemate') {
    message = "It's a Draw!";
    subMessage = "By Stalemate. A well-fought game!";
  } else {
    // Other draw reasons or generic game over
    subMessage = "The game has concluded.";
  }


  const overlayBgClass = theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-md' : 'bg-gray-800/70 backdrop-blur-md';
  const panelBgClass = theme === 'dark' ? 'bg-slate-700/70 border-slate-600/50 shadow-black/50' : 'bg-white/80 border-gray-300/60 shadow-gray-400/30';
  const titleColorClass = theme === 'dark' ? 'text-yellow-300' : 'text-yellow-500';
  const messageColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const subMessageColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  
  const buttonBaseClasses = `w-full sm:w-auto font-semibold py-3 px-7 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  const playAgainButtonThemeClass = theme === 'dark' 
    ? `bg-gradient-to-r from-green-500/90 via-emerald-600/90 to-teal-600/90 hover:from-green-500/95 hover:via-emerald-600/95 hover:to-teal-600/95 text-white focus-visible:ring-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/40`
    : `bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white focus-visible:ring-emerald-400 shadow-emerald-600/30 hover:shadow-emerald-600/40`;


  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[80] p-4`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: numConfetti }).map((_, i) => (
          <ConfettiPiece key={i} theme={theme} />
        ))}
      </div>
      <div 
        className={`relative p-6 sm:p-10 rounded-xl shadow-2xl text-center ${panelBgClass} w-full max-w-md`}
      >
        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${titleColorClass}`} style={{textShadow: theme === 'dark' ? '0 0 12px rgba(252, 211, 77, 0.5)' : '0 0 10px rgba(245, 158, 11, 0.4)'}}>
          Game Over!
        </h1>
        <p className={`text-xl sm:text-2xl font-semibold mb-2 ${messageColorClass}`}>
          {message}
        </p>
        <p className={`text-sm sm:text-base mb-6 ${subMessageColorClass}`}>
          {subMessage}
        </p>
        <button
          onClick={onPlayAgain}
          className={`${buttonBaseClasses} ${playAgainButtonThemeClass}`}
          aria-label="Play Again or Go to Menu"
        >
          New Game / Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverOverlay;