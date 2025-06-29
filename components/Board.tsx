import React from 'react';
import { BoardState, Position, PlayerColor, Theme, LayoutSettings, AIMove, AnalyzedMove } from '../types';
import Square from './Square';
import { getBoardClasses } from '../utils/styleUtils'; 

interface BoardProps {
  boardState: BoardState;
  onSquareClick: (pos: Position) => void;
  selectedPiecePosition: Position | null;
  possibleMoves: Position[];
  currentPlayer: PlayerColor; 
  kingInCheckPosition: Position | null; 
  theme: Theme;
  layoutSettings: LayoutSettings;
  lastMove: { from: Position; to: Position } | null;
  hintSuggestion: AIMove | null;
  hintKey?: string;
  // New props for analysis mode
  analyzedMove?: AnalyzedMove | null;
  bestAlternativeMove?: AIMove | null;
}

const Board: React.FC<BoardProps> = ({
  boardState,
  onSquareClick,
  selectedPiecePosition,
  possibleMoves,
  kingInCheckPosition,
  theme,
  layoutSettings,
  lastMove,
  hintSuggestion,
  hintKey,
  analyzedMove,
  bestAlternativeMove,
}) => {
  const currentBoardStyle = getBoardClasses(layoutSettings.boardStyleId, theme);

  return (
    <div className={`grid grid-cols-8 rounded-lg overflow-hidden ${currentBoardStyle.container}`}>
      {boardState.map((rowState, rowIndex) =>
        rowState.map((squareState, colIndex) => {
          const position: Position = [rowIndex, colIndex];
          const isLightSquare = (rowIndex + colIndex) % 2 === 0;
          const isSelected = selectedPiecePosition
            ? selectedPiecePosition[0] === rowIndex && selectedPiecePosition[1] === colIndex
            : false;
          const isPossible = possibleMoves.some(
            (move) => move[0] === rowIndex && move[1] === colIndex
          );
          
          const isCurrentKingInCheckSquare = kingInCheckPosition ? 
            kingInCheckPosition[0] === rowIndex && kingInCheckPosition[1] === colIndex : false;

          const isLastMoveFromSquare = !!(lastMove && lastMove.from[0] === rowIndex && lastMove.from[1] === colIndex);
          const isLastMoveToSquare = !!(lastMove && lastMove.to[0] === rowIndex && lastMove.to[1] === colIndex);

          const isHintFromSquare = !!(hintSuggestion && hintSuggestion.from[0] === rowIndex && hintSuggestion.from[1] === colIndex);
          const isHintToSquare = !!(hintSuggestion && hintSuggestion.to[0] === rowIndex && hintSuggestion.to[1] === colIndex);

          // Analysis props
          const isAnalyzedMoveFrom = !!(analyzedMove && analyzedMove.from[0] === rowIndex && analyzedMove.from[1] === colIndex);
          const isAnalyzedMoveTo = !!(analyzedMove && analyzedMove.to[0] === rowIndex && analyzedMove.to[1] === colIndex);
          const moveClassification = analyzedMove ? analyzedMove.classification : null;
          const isBestAlternativeMoveFrom = !!(bestAlternativeMove && bestAlternativeMove.from[0] === rowIndex && bestAlternativeMove.from[1] === colIndex);
          const isBestAlternativeMoveTo = !!(bestAlternativeMove && bestAlternativeMove.to[0] === rowIndex && bestAlternativeMove.to[1] === colIndex);

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              squareState={squareState}
              position={position}
              isLightSquare={isLightSquare}
              isSelected={isSelected}
              isPossibleMove={isPossible}
              isKingInCheck={isCurrentKingInCheckSquare}
              onClick={onSquareClick}
              theme={theme}
              boardClasses={currentBoardStyle} 
              layoutSettings={layoutSettings}
              isLastMoveFromSquare={isLastMoveFromSquare}
              isLastMoveToSquare={isLastMoveToSquare}
              lastMoveForFlashKey={lastMove}
              isHintFromSquare={isHintFromSquare}
              isHintToSquare={isHintToSquare}
              hintKey={hintKey}
              isAnalyzedMoveFrom={isAnalyzedMoveFrom}
              isAnalyzedMoveTo={isAnalyzedMoveTo}
              moveClassification={moveClassification}
              isBestAlternativeMoveFrom={isBestAlternativeMoveFrom}
              isBestAlternativeMoveTo={isBestAlternativeMoveTo}
            />
          );
        })
      )}
    </div>
  );
};

export default Board;