import React from 'react';
import { BoardState, Position, PlayerColor } from '../types';
import Square from './Square';

interface BoardProps {
  boardState: BoardState;
  onSquareClick: (pos: Position) => void;
  selectedPiecePosition: Position | null;
  possibleMoves: Position[];
  currentPlayer: PlayerColor; 
  kingInCheckPosition: Position | null; 
}

const Board: React.FC<BoardProps> = ({
  boardState,
  onSquareClick,
  selectedPiecePosition,
  possibleMoves,
  kingInCheckPosition,
}) => {
  return (
    <div className="grid grid-cols-8 border-4 border-stone-700 shadow-xl shadow-stone-900/30 rounded-lg overflow-hidden">
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
            />
          );
        })
      )}
    </div>
  );
};

export default Board;