import React from 'react';
import { LeaderboardEntry } from '../types';
import { formatToBDTime } from '../utils/timeFormatter';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  // Sort by gameEndTime descending (most recent first), take top 10
  const sortedEntries = [...entries]
    .sort((a, b) => b.gameEndTime - a.gameEndTime)
    .slice(0, 10);

  return (
    <div className="w-full max-w-xl bg-white p-5 sm:p-6 rounded-xl shadow-xl border border-stone-300">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-4 sm:mb-5 text-center">
        🏆 Hall of Fame 🏆
      </h2>
      {sortedEntries.length === 0 ? (
        <p className="text-slate-500 text-center italic py-3">
          No games played yet. Be the first champion!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-100">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Sl. No.
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Winner
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Game Concluded (BD)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-100">
              {sortedEntries.map((entry, index) => (
                <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}`}>
                  <td className="px-3 py-3.5 whitespace-nowrap text-sm font-medium text-slate-800 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-sm text-teal-700 font-semibold">
                    {entry.winnerName}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-sm text-slate-500">
                    {formatToBDTime(entry.gameEndTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
