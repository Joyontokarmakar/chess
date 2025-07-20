

import React, { useState, useMemo, useEffect } from 'react';
import { GameAnalysis, LayoutSettings, MoveHistoryEntry, Theme, AnalyzedMove, PlayerColor } from '../types';
import Board from './Board';
import AnalysisPanel from './AnalysisPanel';
import { createInitialBoard } from '../constants';
import Logo from './Logo';

interface AnalysisViewProps {
  theme: Theme;
  layoutSettings: LayoutSettings;
  analysis: GameAnalysis | null;
  isAnalyzing: boolean;
  moveHistory: MoveHistoryEntry[];
  onExit: () => void;
  player1Name: string;
  player2Name: string;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  theme,
  layoutSettings,
  analysis,
  isAnalyzing,
  moveHistory,
  onExit,
  player1Name,
  player2Name,
}) => {
  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(-1); // Start before the first move

  const { boardToDisplay, analyzedMoveForBoard, bestAlternativeForBoard } = useMemo(() => {
    // If there's no analysis or move history, show the initial empty board.
    if (!analysis || moveHistory.length === 0) {
      return { boardToDisplay: createInitialBoard(), analyzedMoveForBoard: null, bestAlternativeForBoard: null };
    }
    
    // The state before any moves is at moveHistory[0].
    // The state after move `i` is at moveHistory[i+1].
    // `currentMoveIdx` of -1 means we want the initial board state.
    const boardStateIndex = currentMoveIdx + 1;

    // Get the board state for the selected move. Fallback to the last known state if out of bounds.
    const boardState = moveHistory[boardStateIndex]?.boardState || moveHistory[moveHistory.length - 1]?.boardState || createInitialBoard();
    
    // Get the analysis data for the selected move.
    const analyzedMove = currentMoveIdx >= 0 ? analysis.fullAnalysis[currentMoveIdx] : null;
    
    return { 
        boardToDisplay: boardState,
        analyzedMoveForBoard: analyzedMove,
        bestAlternativeForBoard: analyzedMove?.bestAlternative || null
    };
  }, [currentMoveIdx, moveHistory, analysis]);

  const handleSelectMove = (index: number) => {
    setCurrentMoveIdx(index);
  };
  
  const headerTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';

  return (
    <div className="flex flex-col w-full h-full max-h-screen p-2 sm:p-4">
        <header className="mb-3 sm:mb-4 text-center w-full relative px-2 sm:px-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Logo theme={theme} className={`w-10 h-10 sm:w-12 sm:h-12 ${headerTextColor}`} />
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${headerTextColor}`} style={{textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
                        Game Analysis
                    </h1>
                </div>
            </div>
        </header>

        <main className="flex-grow flex flex-col md:flex-row items-start justify-center gap-4 overflow-hidden">
            <div className="flex items-center justify-center flex-shrink-0 w-full md:w-auto">
                <Board
                    boardState={boardToDisplay}
                    onSquareClick={() => {}} // Board is not interactive in analysis mode
                    selectedPiecePosition={null}
                    possibleMoves={[]}
                    currentPlayer={currentMoveIdx >= 0 && moveHistory[currentMoveIdx] ? moveHistory[currentMoveIdx].currentPlayer : PlayerColor.WHITE}
                    kingInCheckPosition={null} // Simplified for analysis view
                    theme={theme}
                    layoutSettings={layoutSettings}
                    lastMove={null} // Use analysis highlights instead
                    hintSuggestion={null}
                    analyzedMove={analyzedMoveForBoard}
                    bestAlternativeMove={bestAlternativeForBoard}
                />
            </div>
            
            <div className="w-full md:max-w-md lg:max-w-lg h-full flex-grow flex flex-col">
                <AnalysisPanel
                    theme={theme}
                    analysis={analysis}
                    isAnalyzing={isAnalyzing}
                    onExit={onExit}
                    onSelectMove={handleSelectMove}
                    currentMoveIdx={currentMoveIdx}
                    totalMoves={analysis?.fullAnalysis.length ?? 0}
                    player1Name={player1Name}
                    player2Name={player2Name}
                />
            </div>
        </main>
    </div>
  );
};

export default AnalysisView;