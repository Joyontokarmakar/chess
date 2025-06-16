import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BoardState, PlayerColor, CastlingRights, Position, PieceType, AIMove, SquareState, Piece } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // This will prevent the app from crashing if API_KEY is not set,
  // but AI functionality will be disabled.
  // In a real app, you might want a more user-friendly message or fallback.
  console.warn("API_KEY environment variable is not set. AI opponent will not function.");
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
  currentPlayer: PlayerColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): Promise<AIMove | null> {
  if (!ai) {
    console.error("Gemini AI client is not initialized. Cannot get computer move.");
    // Fallback: return a random valid move or null
    // For now, returning null which will be handled by the caller.
    return null; 
  }

  const formattedBoard = formatBoardForAI(boardState);
  const formattedCastlingRights = formatCastlingRightsForAI(castlingRights);
  
  const promptPayload = {
    board: formattedBoard,
    currentPlayer: currentPlayer, // "White" or "Black"
    castlingRights: formattedCastlingRights,
    enPassantTarget: enPassantTarget, // [row, col] or null
  };

  const systemInstruction = `You are a chess engine. Your goal is to play a strong game of chess as the ${currentPlayer} player.
Given the board state, current player to move, castling rights, and en passant target, provide the best move.
The board is represented as a 2D array where 'wP' is a white pawn, 'bK' is a black king, '..' is an empty square, etc. Rows are 0-7 from Black's side to White's side. Columns are 0-7 from Queen-side to King-side.
Return the move as a JSON object in the format: {"from": [row, col], "to": [row, col]}.
If the move is a pawn promotion, also include a "promotion" field with the piece type (Q, R, B, or N), for example: {"from": [1,0], "to": [0,0], "promotion": "Q"}.
Only provide valid, legal moves for the ${currentPlayer} player. Prioritize winning and strong positional play. Ensure 'from' and 'to' are 0-indexed arrays of two numbers [row, col].`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Ensure this model supports JSON mode well enough or adjust prompt
      contents: JSON.stringify(promptPayload), // Send the structured data as a string within contents
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json", // Critical for getting JSON output
        // thinkingConfig: { thinkingBudget: 0 } // For lower latency, if needed
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedMove = JSON.parse(jsonStr) as AIMove;

    // Basic validation of the parsed move structure
    if (
      parsedMove &&
      Array.isArray(parsedMove.from) && parsedMove.from.length === 2 &&
      Array.isArray(parsedMove.to) && parsedMove.to.length === 2 &&
      typeof parsedMove.from[0] === 'number' && typeof parsedMove.from[1] === 'number' &&
      typeof parsedMove.to[0] === 'number' && typeof parsedMove.to[1] === 'number'
    ) {
      if (parsedMove.promotion && !['Q', 'R', 'B', 'N'].includes(parsedMove.promotion)) {
        console.warn("AI suggested invalid promotion type:", parsedMove.promotion);
        // Decide how to handle: remove promotion, or consider move invalid
        delete parsedMove.promotion; 
      }
      return parsedMove;
    } else {
      console.error("AI response is not in the expected format:", parsedMove);
      return null;
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    // More specific error handling could be added here
    // e.g. if error.message includes "SAFETY", etc.
    return null;
  }
}