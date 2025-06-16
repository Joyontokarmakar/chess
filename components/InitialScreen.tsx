import React from 'react';
import { LeaderboardEntry, GameMode } from '../types';
import Leaderboard from './Leaderboard';
import ModeSelection from './ModeSelection';

interface InitialScreenProps {
  leaderboardData: LeaderboardEntry[];
  onSelectMode: (mode: GameMode) => void;
  // onClearLeaderboard?: () => void; // Optional for dev
}

const InitialScreen: React.FC<InitialScreenProps> = ({ leaderboardData, onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-200 p-4 space-y-6 sm:space-y-8">
      <header className="text-center mb-2 sm:mb-0">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-700 tracking-tight">
          Classic Chess Championship
        </h1>
        <p className="text-md text-slate-500 mt-2">
          Welcome! View past champions or choose a game mode to start.
        </p>
      </header>
      
      <Leaderboard entries={leaderboardData} />
      
      {/* 
      // Example for a clear leaderboard button (development only)
      {leaderboardData.length > 0 && onClearLeaderboard && (
        <button
          onClick={onClearLeaderboard}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow-sm hover:shadow-md transition-all duration-150 ease-in-out text-sm"
        >
          Clear Leaderboard (Dev)
        </button>
      )}
      */}

      <ModeSelection onSelectMode={onSelectMode} />
      
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-slate-500 bg-stone-200">
        <p>&copy; {new Date().getFullYear()} AI Chess. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InitialScreen;
