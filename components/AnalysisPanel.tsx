
import React, { useRef, useEffect } from 'react';
import { GameAnalysis, Theme, MoveClassification, PlayerColor, AnalyzedMove } from '../types';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaSignOutAlt, FaExclamationTriangle, FaLightbulb, FaBook, FaStar } from 'react-icons/fa';

interface AnalysisPanelProps {
  theme: Theme;
  analysis: GameAnalysis | null;
  isAnalyzing: boolean;
  onExit: () => void;
  onSelectMove: (index: number) => void;
  currentMoveIdx: number;
  totalMoves: number;
  player1Name: string;
  player2Name: string;
}

const getClassificationIcon = (classification: MoveClassification | undefined) => {
    switch (classification) {
        case 'brilliant': return <FaStar className="text-green-400" title="Brilliant" />;
        case 'excellent': return <FaStar className="text-cyan-400" title="Excellent" />;
        case 'good': return <FaLightbulb className="text-blue-400" title="Good" />;
        case 'book': return <FaBook className="text-purple-400" title="Book Move" />;
        case 'inaccuracy': return <FaExclamationTriangle className="text-yellow-400" title="Inaccuracy" />;
        case 'mistake': return <FaExclamationTriangle className="text-orange-500" title="Mistake" />;
        case 'blunder': return <FaExclamationTriangle className="text-red-500" title="Blunder" />;
        default: return null;
    }
};

const getClassificationTextClass = (classification: MoveClassification, theme: Theme): string => {
    if (theme === 'dark') {
        switch (classification) {
            case 'brilliant': return 'text-green-300';
            case 'excellent': return 'text-cyan-300';
            case 'inaccuracy': return 'text-yellow-300';
            case 'mistake': return 'text-orange-400';
            case 'blunder': return 'text-red-400';
            case 'book': return 'text-purple-300';
            default: return 'text-slate-300';
        }
    }
    // Light theme
    switch (classification) {
        case 'brilliant': return 'text-green-600';
        case 'excellent': return 'text-cyan-600';
        case 'inaccuracy': return 'text-yellow-600';
        case 'mistake': return 'text-orange-600';
        case 'blunder': return 'text-red-600';
        case 'book': return 'text-purple-600';
        default: return 'text-slate-700';
    }
};

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
    theme, analysis, isAnalyzing, onExit, onSelectMove, currentMoveIdx, totalMoves, player1Name, player2Name
}) => {
  const panelBgClass = theme === 'dark' ? 'bg-slate-800/70 backdrop-blur-xl border border-slate-700/60' : 'bg-white/70 backdrop-blur-xl border-gray-300/60';
  const textColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const strongTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const scrollbarStyles = theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50';
  const buttonBase = `p-2 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`;
  const navButtonTheme = theme === 'dark' ? 'bg-slate-700/80 hover:bg-slate-600/90 text-slate-200 focus-visible:ring-sky-400' : 'bg-gray-200/80 hover:bg-gray-300/90 text-slate-700 focus-visible:ring-sky-500';
  const exitButtonTheme = theme === 'dark' ? 'bg-red-700/80 hover:bg-red-600/90 text-white focus-visible:ring-red-400' : 'bg-red-600/80 hover:bg-red-500/90 text-white focus-visible:ring-red-400';
  
  const moveListRef = useRef<HTMLDivElement>(null);
  
  const selectedAnalyzedMove: AnalyzedMove | undefined = currentMoveIdx >= 0 ? analysis?.fullAnalysis[currentMoveIdx] : undefined;
  
  useEffect(() => {
    if (moveListRef.current) {
      const selectedItem = moveListRef.current.querySelector(`[data-move-index="${currentMoveIdx}"]`);
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [currentMoveIdx]);

  return (
    <div className={`w-full h-full p-3 sm:p-4 rounded-xl shadow-lg flex flex-col ${panelBgClass}`}>
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
          <p className={`mt-4 text-lg font-semibold ${textColor}`}>Analyzing game...</p>
        </div>
      )}
      {!isAnalyzing && analysis && (
        <>
          <div className="flex-shrink-0">
            <h3 className={`text-lg font-semibold mb-2 ${strongTextColor}`}>Game Summary</h3>
            <p className={`text-sm mb-3 ${textColor}`}>{analysis.summary}</p>
          </div>

          <div ref={moveListRef} className={`flex-grow my-2 p-2 rounded-md overflow-y-auto border scrollbar-thin ${scrollbarStyles} ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-300'}`}>
            <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1">
              {analysis.fullAnalysis.map((move, index) => {
                const isWhiteMove = move.color === PlayerColor.WHITE;
                const moveNumberDisplay = isWhiteMove ? `${move.moveNumber}.` : '';
                return (
                    <React.Fragment key={index}>
                      <div className={`text-right text-xs ${textColor}`}>{moveNumberDisplay}</div>
                      {isWhiteMove ? (
                        <button 
                            onClick={() => onSelectMove(index)}
                            data-move-index={index}
                            className={`text-left text-sm font-semibold rounded px-1 py-0.5 flex items-center gap-1.5 ${currentMoveIdx === index ? (theme === 'dark' ? 'bg-sky-700/50' : 'bg-sky-200/70') : 'hover:bg-slate-500/20'}`}
                        >
                            {getClassificationIcon(move.classification)} {move.san}
                        </button>
                      ) : <div/>}
                      {!isWhiteMove ? (
                        <button 
                            onClick={() => onSelectMove(index)}
                            data-move-index={index}
                            className={`text-left text-sm font-semibold rounded px-1 py-0.5 flex items-center gap-1.5 ${currentMoveIdx === index ? (theme === 'dark' ? 'bg-sky-700/50' : 'bg-sky-200/70') : 'hover:bg-slate-500/20'}`}
                        >
                             {getClassificationIcon(move.classification)} {move.san}
                        </button>
                      ) : <div/>}
                    </React.Fragment>
                );
              })}
            </div>
          </div>
          
          <div className="flex-shrink-0 mt-2">
            <h4 className={`text-base font-semibold ${strongTextColor}`}>Move Details</h4>
            <div className={`p-2 rounded-md min-h-[6rem] text-sm ${textColor} ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-100/50'}`}>
              {selectedAnalyzedMove ? (
                <div>
                  <p>
                    <strong className={getClassificationTextClass(selectedAnalyzedMove.classification, theme)}>
                      {selectedAnalyzedMove.classification.charAt(0).toUpperCase() + selectedAnalyzedMove.classification.slice(1)}:
                    </strong>
                    {' '}{selectedAnalyzedMove.explanation}
                  </p>
                  {selectedAnalyzedMove.bestAlternative && (
                    <p className="mt-1">
                        <strong className={theme === 'dark' ? 'text-teal-300' : 'text-teal-700'}>
                            Best move was {selectedAnalyzedMove.bestAlternative.san}.
                        </strong>
                        {' '}{selectedAnalyzedMove.bestAlternative.explanation}
                    </p>
                  )}
                </div>
              ) : (
                <p>Select a move from the list to see details.</p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 grid grid-cols-5 gap-2 mt-4">
            <button onClick={() => onSelectMove(-1)} disabled={currentMoveIdx === -1} className={`${buttonBase} ${navButtonTheme}`}><FaAngleDoubleLeft size="1.2em" /></button>
            <button onClick={() => onSelectMove(currentMoveIdx - 1)} disabled={currentMoveIdx < 0} className={`${buttonBase} ${navButtonTheme}`}><FaChevronLeft size="1.2em" /></button>
            <button onClick={onExit} className={`${buttonBase} ${exitButtonTheme} col-span-1`}><FaSignOutAlt size="1.2em" /></button>
            <button onClick={() => onSelectMove(currentMoveIdx + 1)} disabled={currentMoveIdx >= totalMoves - 1} className={`${buttonBase} ${navButtonTheme}`}><FaChevronRight size="1.2em" /></button>
            <button onClick={() => onSelectMove(totalMoves - 1)} disabled={currentMoveIdx === totalMoves - 1} className={`${buttonBase} ${navButtonTheme}`}><FaAngleDoubleRight size="1.2em" /></button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisPanel;
