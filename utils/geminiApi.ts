import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BoardState, PlayerColor, CastlingRights, Position, PieceType, AIMove, Piece, AIDifficultyLevel } from '../types';
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
  enPassantTarget: Position | null,
  difficulty: AIDifficultyLevel = AIDifficultyLevel.MEDIUM // Default to medium
): Promise<AIMove | null> {
  // Offline Random AI (Fallback or if API_KEY is missing)
  if (!ai) {
    console.log(`Gemini AI client not initialized or API key missing. Using offline random move generator for difficulty: ${difficulty}.`);
    
    const allPossibleMovesForAI: Array<{ from: Position; to: Position; promotion?: PieceType }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece.color === currentPlayer) {
          const moves = getPossibleMoves(boardState, [r, c], currentPlayer, castlingRights, enPassantTarget);
          moves.forEach(move => {
            // Check for pawn promotion for offline AI
            let promotionType: PieceType | undefined = undefined;
            if (piece.type === PieceType.PAWN && 
                ((piece.color === PlayerColor.WHITE && move[0] === 0) || (piece.color === PlayerColor.BLACK && move[0] === 7))) {
              promotionType = PieceType.QUEEN; // Default to Queen
            }
            allPossibleMovesForAI.push({ from: [r,c] as Position, to: move, promotion: promotionType });
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
    console.log("Offline AI selected move:", randomMove);
    return randomMove;
  }

  // Gemini AI Logic
  const formattedBoard = formatBoardForAI(boardState);
  const formattedCastlingRights = formatCastlingRightsForAI(castlingRights);
  
  const promptPayload = {
    board: formattedBoard,
    currentPlayer: currentPlayer, 
    castlingRights: formattedCastlingRights,
    enPassantTarget: enPassantTarget,
    // Future: Could include move history for context if needed for very advanced AI
  };

  let systemInstruction = `You are a chess engine playing as ${currentPlayer}. Your goal is to win.
Provide the best move as a JSON object: {"from": [row, col], "to": [row, col]}.
If pawn promotion: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N"}.
Board is 0-indexed: row 0 is Black's back rank, col 0 is Queen-side. Only legal moves.`;

  let thinkingConfig: { thinkingBudget: number } | undefined = { thinkingBudget: 0 }; // Default for Medium/Easy

  switch (difficulty) {
    case AIDifficultyLevel.EASY:
      systemInstruction = `You are a beginner chess player playing as ${currentPlayer}. Try to make legal moves. It's okay to make mistakes or less optimal moves. 
      Return move as JSON: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N" (if any)}.`;
      break;
    case AIDifficultyLevel.MEDIUM:
      // Uses default systemInstruction and thinkingConfig (fast)
      break;
    case AIDifficultyLevel.HARD:
      systemInstruction = `You are a strong chess engine playing as ${currentPlayer}. Analyze carefully and make strong positional and tactical moves.
      Return move as JSON: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N" (if any)}.`;
      thinkingConfig = undefined; // Allow more thinking time
      break;
    case AIDifficultyLevel.GRANDMASTER:
      systemInstruction = `You are a grandmaster-level chess AI playing as ${currentPlayer}. Play the absolute best chess possible, considering deep lines and complex strategies.
      Return move as JSON: {"from": [row,col], "to": [row,col], "promotion": "Q" | "R" | "B" | "N" (if any)}.`;
      thinkingConfig = undefined; // Allow maximum thinking time
      break;
  }
  
  console.log(`AI Difficulty: ${difficulty}, Thinking Config: ${thinkingConfig ? JSON.stringify(thinkingConfig) : 'Default (enabled)'}`);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: JSON.stringify(promptPayload),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        ...(thinkingConfig && { thinkingConfig }), // Spread thinkingConfig only if it's defined
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
          pieceBeingMovedOnline.color === currentPlayer && // Ensure AI is moving its own pawn
          ((currentPlayer === PlayerColor.WHITE && toRow === 0) || (currentPlayer === PlayerColor.BLACK && toRow === 7))
      ) {
          if (!parsedMove.promotion || !['Q', 'R', 'B', 'N'].includes(parsedMove.promotion)) {
              console.warn(`AI move from [${fromRow},${fromCol}] to [${toRow},${parsedMove.to[1]}] is a promotion for ${currentPlayer} but no valid promotion piece was specified. Defaulting to Queen.`);
              parsedMove.promotion = PieceType.QUEEN; 
          }
      } else if (parsedMove.promotion && !['Q', 'R', 'B', 'N'].includes(parsedMove.promotion)) {
         console.warn("AI suggested invalid promotion type:", parsedMove.promotion, "Removing it.");
         delete parsedMove.promotion; 
      }
      return parsedMove;
    } else {
      console.error("AI response is not in the expected AIMove format:", parsedMove);
      return null;
    }

  } catch (error) {
    console.error(`Error calling Gemini API for ${difficulty} AI or parsing response:`, error);
    return null; // Fallback handled by App.tsx
  }
}
