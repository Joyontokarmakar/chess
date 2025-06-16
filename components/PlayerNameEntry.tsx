import React, { useState } from 'react';
import { GameMode } from '../types';
import { AI_PLAYER_NAME } from '../constants';

interface PlayerNameEntryProps {
  gameMode: GameMode;
  onSetupComplete: (player1Name: string, player2Name?: string) => void;
}

const PlayerNameEntry: React.FC<PlayerNameEntryProps> = ({ gameMode, onSetupComplete }) => {
  const [p1Name, setP1Name] = useState<string>('Player 1');
  const [p2Name, setP2Name] = useState<string>('Player 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameMode === 'computer') {
      onSetupComplete(p1Name.trim() || "Player 1", AI_PLAYER_NAME);
    } else {
      onSetupComplete(p1Name.trim() || "Player 1", p2Name.trim() || "Player 2");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-stone-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6 text-center">Enter Player Names</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="player1Name" className="block text-sm font-medium text-red-700 mb-1">
              Player 1 (White)
            </label>
            <input
              type="text"
              id="player1Name"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              className="w-full p-2.5 rounded-md border border-stone-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none shadow-sm"
              maxLength={25}
              placeholder="Enter name for Player 1"
            />
          </div>

          {gameMode === 'friend' && (
            <div>
              <label htmlFor="player2Name" className="block text-sm font-medium text-teal-600 mb-1">
                Player 2 (Black)
              </label>
              <input
                type="text"
                id="player2Name"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full p-2.5 rounded-md border border-stone-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-sm"
                maxLength={25}
                placeholder="Enter name for Player 2"
              />
            </div>
          )}

          {gameMode === 'computer' && (
            <div>
              <label htmlFor="player2NameDisabled" className="block text-sm font-medium text-teal-600 mb-1">
                Player 2 (Black)
              </label>
              <input
                type="text"
                id="player2NameDisabled"
                value={AI_PLAYER_NAME}
                disabled
                className="w-full p-2.5 rounded-md border border-stone-300 bg-stone-100 text-slate-500 outline-none shadow-sm"
              />
               <p className="text-xs text-stone-500 mt-1">You are playing against the AI.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
            aria-label="Start Game"
          >
            Start Game
          </button>
        </form>
      </div>
      {/* Footer removed as InitialScreen will have a global one. A fixed footer from InitialScreen might overlay, so that's been adjusted too. */}
    </div>
  );
};

export default PlayerNameEntry;
