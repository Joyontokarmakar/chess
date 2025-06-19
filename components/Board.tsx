import React from 'react';
import { BoardState, Position, PlayerColor, Theme, LayoutSettings } from '../types';
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
  lastMove: { from: Position; to: Position } | null; // Added lastMove prop
}

const Board: React.FC<BoardProps> = ({
  boardState,
  onSquareClick,
  selectedPiecePosition,
  possibleMoves,
  kingInCheckPosition,
  theme,
  layoutSettings,
  lastMove, // Destructure lastMove
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
              isLastMoveFromSquare={isLastMoveFromSquare} // Pass down
              isLastMoveToSquare={isLastMoveToSquare}   // Pass down
            />
          );
        })
      )}
    </div>
  );
};

export default Board;