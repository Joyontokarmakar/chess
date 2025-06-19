
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BoardState, PlayerColor, CastlingRights, Position, PieceType, AIMove, Piece } from '../types';
import { getPossibleMoves } from './chessLogic'; // Import getPossibleMoves

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable is not set. AI opponent will use a basic offline random move generator if played against.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

function pieceToNotation(piece: Piece | null): string {
  if (!piece) return ".."; // Represent empty square
  return (piece.color === PlayerColor.WHITE ? 'w' : 'b') + piece.type;
}

function formatBoardForAI(board: BoardState): string[][] {
  return board.map(row => row.map(piece => pieceToNotation(piece)));
}

function formatCastlingRightsForAI(castlingRights: CastlingRights): any {
    return {
        White: {
            kingSide: castlingRights[PlayerColor.WHITE].kingSide,
            queenSide: castlingRights[PlayerColor.WHITE].queenSide,
        },
        Black: {
            kingSide: castlingRights[PlayerColor.BLACK].kingSide,
            queenSide: castlingRights[PlayerColor.BLACK].queenSide,
        }
    };
}


export async function getComputerMove(
  boardState: BoardState,
  currentPlayer: PlayerColor, // This will be PlayerColor.BLACK for the AI
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): Promise<AIMove | null> {
  if (!ai) {
    console.log("Gemini AI client not initialized. Using offline random move generator.");
    
    const allPossibleMovesForAI: Array<{ from: Position; to: Position; promotion?: PieceType }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece.color === currentPlayer) { // currentPlayer is PlayerColor.BLACK for AI
          const moves = getPossibleMoves(boardState, [r, c], currentPlayer, castlingRights, enPassantTarget);
          moves.forEach(move => {
            allPossibleMovesForAI.push({ from: [r,c] as Position, to: move });
          });
        }
      }
    }

    if (allPossibleMovesForAI.length === 0) {
      console.log("Offline AI: No legal moves found.");
      return null; 
    }

    const randomMoveIndex = Math.floor(Math.random() * allPossibleMovesForAI.length);
    const randomMove = allPossibleMovesForAI[randomMoveIndex];

    const pieceBeingMoved = boardState[randomMove.from[0]][randomMove.from[1]];
    if (
      pieceBeingMoved &&
      pieceBeingMoved.type === PieceType.PAWN &&
      pieceBeingMoved.color === PlayerColor.BLACK && // AI is Black
      randomMove.to[0] === 7 // Promotion rank for Black pawns (board is 0-indexed, 7 is White's back rank)
    ) {
      randomMove.promotion = PieceType.QUEEN; // Default to Queen for offline AI promotion
      console.log("Offline AI: Pawn promotion to Queen selected for move:", randomMove);
    }
    console.log("Offline AI selected move:", randomMove);
    return randomMove;
  }

  // If ai client is available, proceed with API call
  const formattedBoard = formatBoardForAI(boardState);
  const formattedCastlingRights = formatCastlingRightsForAI(castlingRights);
  
  const promptPayload = {
    board: formattedBoard,
    currentPlayer: currentPlayer, 
    castlingRights: formattedCastlingRights,
    enPassantTarget: enPassantTarget,
  };

  const systemInstruction = `You are a chess engine. Your goal is to play a strong game of chess as the ${currentPlayer} player.
Given the board state, current player to move, castling rights, and en passant target, provide the best move.
The board is represented as a 2D array where 'wP' is a white pawn, 'bK' is a black king, '..' is an empty square, etc. Rows are 0-7 from Black's side to White's side. Columns are 0-7 from Queen-side to King-side.
Return the move as a JSON object in the format: {"from": [row, col], "to": [row, col]}.
If the move is a pawn promotion, also include a "promotion" field with the piece type (Q, R, B, or N), for example: {"from": [1,0], "to": [0,0], "promotion": "Q"}.
Only provide valid, legal moves for the ${currentPlayer} player. Prioritize winning and strong positional play. Ensure 'from' and 'to' are 0-indexed arrays of two numbers [row, col].`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: JSON.stringify(promptPayload),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedMove = JSON.parse(jsonStr) as AIMove;

    if (
      parsedMove &&
      Array.isArray(parsedMove.from) && parsedMove.from.length === 2 &&
      Array.isArray(parsedMove.to) && parsedMove.to.length === 2 &&
      typeof parsedMove.from[0] === 'number' && typeof parsedMove.from[1] === 'number' &&
      typeof parsedMove.to[0] === 'number' && typeof parsedMove.to[1] === 'number'
    ) {
      const fromRow = parsedMove.from[0];
      const fromCol = parsedMove.from[1]; 
      const toRow = parsedMove.to[0];

      const pieceBeingMovedOnline = boardState[fromRow]?.[fromCol];

      if (pieceBeingMovedOnline &&
          pieceBeingMovedOnline.type === PieceType.PAWN &&
          pieceBeingMovedOnline.color === PlayerColor.BLACK && 
          toRow === 7 
      ) {
          if (!parsedMove.promotion || !['Q', 'R', 'B', 'N'].includes(parsedMove.promotion)) {
              console.warn(`Online AI move from [${fromRow},${fromCol}] to [${toRow},${parsedMove.to[1]}] is a promotion for Black but no valid promotion piece was specified. Defaulting to Queen.`);
              parsedMove.promotion = PieceType.QUEEN; 
          }
      } else if (parsedMove.promotion && !['Q', 'R', 'B', 'N'].includes(parsedMove.promotion)) {
         console.warn("Online AI suggested invalid promotion type:", parsedMove.promotion, "Removing it.");
         delete parsedMove.promotion; 
      }
      return parsedMove;
    } else {
      console.error("Online AI response is not in the expected AIMove format:", parsedMove);
      return null;
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    // If the API call fails (e.g., network error, API key issue after initialization),
    // return null. App.tsx will handle this by giving the turn back to White.
    return null;
  }
}