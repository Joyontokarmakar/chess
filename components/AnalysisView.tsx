
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
  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(0); // Start at the first move

  useEffect(() => {
    // When analysis loads, ensure we are on the first move if we were at the initial state.
    if (analysis && !isAnalyzing && currentMoveIdx < 0) {
      setCurrentMoveIdx(0);
    }
  }, [analysis, isAnalyzing, currentMoveIdx]);


  const { boardToDisplay, analyzedMoveForBoard, bestAlternativeForBoard } = useMemo(() => {
    if (moveHistory.length === 0) {
      return { boardToDisplay: createInitialBoard(), analyzedMoveForBoard: null, bestAlternativeForBoard: null };
    }
    
    let boardState;
    if (currentMoveIdx < 0) {
        // Initial board state before any moves
        boardState = moveHistory[0]?.boardState || createInitialBoard();
    } else {
        // Find the move history entry *after* the current move has been made
        const moveEntry = moveHistory.find(h => h.lastMove && h.lastMove.from[0] === analysis?.fullAnalysis[currentMoveIdx]?.from[0] && h.lastMove.from[1] === analysis?.fullAnalysis[currentMoveIdx]?.from[1] && h.lastMove.to[0] === analysis?.fullAnalysis[currentMoveIdx]?.to[0] && h.lastMove.to[1] === analysis?.fullAnalysis[currentMoveIdx]?.to[1]);
        
        // The board state is from the NEXT entry in the history, which is the state AFTER the move was made.
        const stateEntryIndex = moveHistory.findIndex(h => h.fenBeforeMove === moveEntry?.fenBeforeMove);
        
        boardState = moveHistory[stateEntryIndex + 1]?.boardState || moveHistory[moveHistory.length -1].boardState;
    }

    // The analyzed move corresponds to the current state.
    const analyzedMove = analysis?.fullAnalysis[currentMoveIdx];
    
    return { 
        boardToDisplay: boardState,
        analyzedMoveForBoard: analyzedMove || null,
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
