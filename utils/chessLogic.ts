
import { BoardState, Piece, PieceType, PlayerColor, Position, CastlingRights, SquareState, MakeMoveResult } from '../types';

export function createDeepBoardCopy(board: BoardState): BoardState {
  return board.map(row => row.map(piece => (piece ? { ...piece } : null)));
}

export function isPositionOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function findKingPosition(board: BoardState, color: PlayerColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

export function isSquareAttacked(
  board: BoardState,
  pos: Position,
  attackerColor: PlayerColor
): boolean {
  const [targetRow, targetCol] = pos;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor) {
        const moves = getPieceBasicMoves(board, [r, c], piece, true); // true for attack check (ignore self-check for this)
        if (moves.some(([mr, mc]) => mr === targetRow && mc === targetCol)) {
          return true;
        }
      }
    }
  }
  return false;
}

function getPieceBasicMoves(
  board: BoardState,
  pos: Position,
  piece: Piece,
  isAttackCheck: boolean = false, // When true, pawn captures diagonally even if empty (for attack map)
  enPassantTarget?: Position | null
): Position[] {
  const [row, col] = pos;
  const moves: Position[] = [];
  const color = piece.color;
  const opponentColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;

  const addMove = (r: number, c: number, canCapture: boolean = true, mustBeEmpty: boolean = false) => {
    if (!isPositionOnBoard(r, c)) return;
    const targetPiece = board[r][c];
    if (targetPiece) {
      if (targetPiece.color !== color && canCapture) moves.push([r, c]);
    } else {
      if (!mustBeEmpty || isAttackCheck) moves.push([r,c]);
    }
  };
  
  const addLineMoves = (dr: number, dc: number) => {
    for (let i = 1; i < 8; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      if (!isPositionOnBoard(r, c)) break;
      const targetPiece = board[r][c];
      if (targetPiece) {
        if (targetPiece.color !== color) moves.push([r, c]);
        break;
      }
      moves.push([r, c]);
    }
  };

  switch (piece.type) {
    case PieceType.PAWN:
      const direction = color === PlayerColor.WHITE ? -1 : 1;
      // Forward one
      if (isPositionOnBoard(row + direction, col) && !board[row + direction][col]) {
        moves.push([row + direction, col]);
        // Forward two (initial move)
        if (!piece.hasMoved && isPositionOnBoard(row + 2 * direction, col) && !board[row + 2 * direction][col]) {
          moves.push([row + 2 * direction, col]);
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const r = row + direction;
        const c = col + dc;
        if (isPositionOnBoard(r, c)) {
          const targetPiece = board[r][c];
          if (targetPiece && targetPiece.color === opponentColor) {
            moves.push([r, c]);
          }
          // En passant
          if (enPassantTarget && enPassantTarget[0] === r && enPassantTarget[1] === c) {
            moves.push([r,c]);
          }
           if (isAttackCheck) moves.push([r,c]); // For checking attacked squares
        }
      }
      break;
    case PieceType.ROOK:
      addLineMoves(1, 0); addLineMoves(-1, 0);
      addLineMoves(0, 1); addLineMoves(0, -1);
      break;
    case PieceType.KNIGHT:
      const knightMoves: Position[] = [
        [row-2,col-1], [row-2,col+1], [row-1,col-2], [row-1,col+2],
        [row+1,col-2], [row+1,col+2], [row+2,col-1], [row+2,col+2],
      ];
      knightMoves.forEach(([r,c]) => addMove(r,c));
      break;
    case PieceType.BISHOP:
      addLineMoves(1, 1); addLineMoves(1, -1);
      addLineMoves(-1, 1); addLineMoves(-1, -1);
      break;
    case PieceType.QUEEN:
      addLineMoves(1, 0); addLineMoves(-1, 0); addLineMoves(0, 1); addLineMoves(0, -1);
      addLineMoves(1, 1); addLineMoves(1, -1); addLineMoves(-1, 1); addLineMoves(-1, -1);
      break;
    case PieceType.KING:
      const kingMoves: Position[] = [
        [row-1,col-1], [row-1,col], [row-1,col+1],
        [row,  col-1],             [row,  col+1],
        [row+1,col-1], [row+1,col], [row+1,col+1],
      ];
      kingMoves.forEach(([r,c]) => addMove(r,c));
      break;
  }
  return moves;
}

export function getPossibleMoves(
  board: BoardState,
  pos: Position,
  currentPlayer: PlayerColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[pos[0]][pos[1]];
  if (!piece || piece.color !== currentPlayer) return [];

  let moves = getPieceBasicMoves(board, pos, piece, false, enPassantTarget);

  // Add castling moves
  if (piece.type === PieceType.KING && !piece.hasMoved) {
    const kingRow = currentPlayer === PlayerColor.WHITE ? 7 : 0;
    const opponentColor = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    // King-side castling
    if (castlingRights[currentPlayer].kingSide) {
      if (!board[kingRow][5] && !board[kingRow][6] &&
          !isSquareAttacked(board, [kingRow, 4], opponentColor) &&
          !isSquareAttacked(board, [kingRow, 5], opponentColor) &&
          !isSquareAttacked(board, [kingRow, 6], opponentColor)) {
        moves.push([kingRow, 6]);
      }
    }
    // Queen-side castling
    if (castlingRights[currentPlayer].queenSide) {
       if (!board[kingRow][1] && !board[kingRow][2] && !board[kingRow][3] &&
           !isSquareAttacked(board, [kingRow, 4], opponentColor) &&
           !isSquareAttacked(board, [kingRow, 3], opponentColor) &&
           !isSquareAttacked(board, [kingRow, 2], opponentColor)) {
        moves.push([kingRow, 2]);
      }
    }
  }
  
  // Filter out moves that leave the king in check
  return moves.filter(move => {
    const tempBoard = createDeepBoardCopy(board);
    const [fromRow, fromCol] = pos;
    const [toRow, toCol] = move;
    
    const movedPiece = { ...tempBoard[fromRow][fromCol]!, hasMoved: true };
    tempBoard[toRow][toCol] = movedPiece;
    tempBoard[fromRow][fromCol] = null;

    // Handle castling rook move in tempBoard
    if (movedPiece.type === PieceType.KING && Math.abs(toCol - fromCol) === 2) {
      if (toCol === 6) { // King-side
        const rook = tempBoard[toRow][7]; // Rook is on original square before virtual move
        if (rook) tempBoard[toRow][5] = {...rook, hasMoved: true};
        tempBoard[toRow][7] = null;
      } else { // Queen-side toCol === 2
        const rook = tempBoard[toRow][0]; // Rook is on original square
        if (rook) tempBoard[toRow][3] = {...rook, hasMoved: true};
        tempBoard[toRow][0] = null;
      }
    }
     // Handle en passant capture in tempBoard
    if (movedPiece.type === PieceType.PAWN && enPassantTarget && toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
        const capturedPawnRow = movedPiece.color === PlayerColor.WHITE ? toRow + 1 : toRow - 1;
        tempBoard[capturedPawnRow][toCol] = null;
    }
    
    const kingPos = findKingPosition(tempBoard, currentPlayer);
    return kingPos ? !isSquareAttacked(tempBoard, kingPos, currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE) : true;
  });
}


export function isKingInCheck(board: BoardState, kingColor: PlayerColor): boolean {
  const kingPos = findKingPosition(board, kingColor);
  if (!kingPos) return false; 
  return isSquareAttacked(board, kingPos, kingColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
}

export function hasLegalMoves(
  board: BoardState,
  playerColor: PlayerColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === playerColor) {
        const moves = getPossibleMoves(board, [r, c], playerColor, castlingRights, enPassantTarget);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function isCheckmate(
  board: BoardState,
  playerColor: PlayerColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): boolean {
  if (!isKingInCheck(board, playerColor)) return false;
  return !hasLegalMoves(board, playerColor, castlingRights, enPassantTarget);
}

export function isStalemate(
  board: BoardState,
  playerColor: PlayerColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): boolean {
  if (isKingInCheck(board, playerColor)) return false;
  return !hasLegalMoves(board, playerColor, castlingRights, enPassantTarget);
}

export function makeMove(
  board: BoardState,
  from: Position,
  to: Position,
  currentCastlingRights: CastlingRights,
  currentEnPassantTarget: Position | null,
  promotionPieceType?: PieceType
): MakeMoveResult {
  const newBoard = createDeepBoardCopy(board);
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = newBoard[fromRow][fromCol];

  if (!piece) throw new Error("No piece at source square");

  const capturedPiece: Piece | null = board[toRow][toCol] ? { ...board[toRow][toCol]! } : null; // Piece on original board at destination

  const newPiece: Piece = { ...piece, hasMoved: true };
  newBoard[toRow][toCol] = newPiece;
  newBoard[fromRow][fromCol] = null;
  
  let newEnPassantTarget: Position | null = null;
  let promotionSquare: Position | null = null;

  // Handle pawn promotion
  if (piece.type === PieceType.PAWN) {
    if ((piece.color === PlayerColor.WHITE && toRow === 0) || (piece.color === PlayerColor.BLACK && toRow === 7)) {
      if (promotionPieceType) {
        newBoard[toRow][toCol] = { ...newPiece, type: promotionPieceType, id: newPiece.id.replace(/P\d*$/, promotionPieceType) };
      } else {
        promotionSquare = [toRow, toCol]; // Signal that promotion is needed
      }
    }
    // Set en passant target
    if (Math.abs(toRow - fromRow) === 2) {
      newEnPassantTarget = [ (fromRow + toRow) / 2, fromCol ];
    }
    // Handle en passant capture
    if (currentEnPassantTarget && toRow === currentEnPassantTarget[0] && toCol === currentEnPassantTarget[1]) {
       const capturedPawnRow = piece.color === PlayerColor.WHITE ? toRow + 1 : toRow -1;
       // The captured piece in en passant is not on the 'to' square, it's adjacent.
       // The 'capturedPiece' variable above would be null in this case.
       // We need to return the actual pawn captured via en passant.
       const enPassantCapturedPiece = board[capturedPawnRow][toCol];
       newBoard[capturedPawnRow][toCol] = null;
       return { 
           newBoard, 
           newCastlingRights: currentCastlingRights, // Castling rights update below
           newEnPassantTarget, 
           promotionSquare, 
           capturedPiece: enPassantCapturedPiece ? { ...enPassantCapturedPiece } : null 
        };
    }
  }

  // Handle castling rook move
  const newCastlingRights = JSON.parse(JSON.stringify(currentCastlingRights)); 

  if (piece.type === PieceType.KING) {
    newCastlingRights[piece.color].kingSide = false;
    newCastlingRights[piece.color].queenSide = false;
    if (Math.abs(toCol - fromCol) === 2) { 
      if (toCol === 6) { 
        const rook = newBoard[toRow][7];
        if (rook) {
          newBoard[toRow][5] = { ...rook, hasMoved: true };
          newBoard[toRow][7] = null;
        }
      } else { 
        const rook = newBoard[toRow][0];
        if (rook) {
          newBoard[toRow][3] = { ...rook, hasMoved: true };
          newBoard[toRow][0] = null;
        }
      }
    }
  }

  // Update castling rights if rooks move or are captured
  if (piece.type === PieceType.ROOK && !piece.hasMoved) { // Only if it's the rook's first move
    if (fromRow === 0 && fromCol === 0 && piece.color === PlayerColor.BLACK) newCastlingRights[PlayerColor.BLACK].queenSide = false;
    if (fromRow === 0 && fromCol === 7 && piece.color === PlayerColor.BLACK) newCastlingRights[PlayerColor.BLACK].kingSide = false;
    if (fromRow === 7 && fromCol === 0 && piece.color === PlayerColor.WHITE) newCastlingRights[PlayerColor.WHITE].queenSide = false;
    if (fromRow === 7 && fromCol === 7 && piece.color === PlayerColor.WHITE) newCastlingRights[PlayerColor.WHITE].kingSide = false;
  }
  
  // If a rook is captured on its starting square, its castling right is lost
  if (capturedPiece && capturedPiece.type === PieceType.ROOK) {
    if (toRow === 0 && toCol === 0 && capturedPiece.color === PlayerColor.BLACK) newCastlingRights[PlayerColor.BLACK].queenSide = false;
    if (toRow === 0 && toCol === 7 && capturedPiece.color === PlayerColor.BLACK) newCastlingRights[PlayerColor.BLACK].kingSide = false;
    if (toRow === 7 && toCol === 0 && capturedPiece.color === PlayerColor.WHITE) newCastlingRights[PlayerColor.WHITE].queenSide = false;
    if (toRow === 7 && toCol === 7 && capturedPiece.color === PlayerColor.WHITE) newCastlingRights[PlayerColor.WHITE].kingSide = false;
  }

  return { newBoard, newCastlingRights, newEnPassantTarget, promotionSquare, capturedPiece };
}
