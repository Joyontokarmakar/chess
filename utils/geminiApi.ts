

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BoardState, PlayerColor, CastlingRights, Position, PieceType, AIMove, Piece, AIDifficultyLevel, MoveHistoryEntry, GameAnalysis, AnalyzedMove } from '../types';
import { getPossibleMoves } from './chessLogic';

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

function formatMoveForExplanation(move: AIMove, board: BoardState, currentPlayer: PlayerColor): string {
    const piece = board[move.from[0]][move.from[1]];
    const pieceName = piece ? `${piece.color} ${piece.type}` : "piece"; // Should always be a piece
    const fromAlg = String.fromCharCode(97 + move.from[1]) + (8 - move.from[0]);
    const toAlg = String.fromCharCode(97 + move.to[1]) + (8 - move.to[0]);
    let moveStr = `${pieceName} from ${fromAlg} to ${toAlg}`;
    if (move.promotion) {
        moveStr += ` promoting to ${move.promotion}`;
    }
    return moveStr;
}


export async function getComputerMove(
  boardState: BoardState,
  currentPlayer: PlayerColor, // This will be PlayerColor.BLACK for the AI
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  difficulty: AIDifficultyLevel = AIDifficultyLevel.MEDIUM 
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

  let systemInstruction: string;
  let thinkingConfig: { thinkingBudget: number } | undefined; // Initialize as undefined, will be set in switch

  switch (difficulty) {
    case AIDifficultyLevel.EASY:
      systemInstruction = `You are a beginner chess player playing as ${currentPlayer}. Try to make legal moves. It's okay to make mistakes or less optimal moves. 
      Return move as JSON: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N" (if any)}.`;
      thinkingConfig = { thinkingBudget: 0 }; // Disable thinking for Easy
      break;
    case AIDifficultyLevel.MEDIUM:
      systemInstruction = `You are a chess engine playing as ${currentPlayer}. Your goal is to win.
Provide the best move as a JSON object: {"from": [row, col], "to": [row, col]}.
If pawn promotion: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N"}.
Board is 0-indexed: row 0 is Black's back rank, col 0 is Queen-side. Only legal moves.`;
      thinkingConfig = undefined; // Use default (enabled) thinking for Medium
      break;
    case AIDifficultyLevel.HARD:
      systemInstruction = `You are a strong chess engine playing as ${currentPlayer}. Analyze carefully and make strong positional and tactical moves.
      Return move as JSON: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N" (if any)}.`;
      thinkingConfig = undefined; // Allow more thinking time (default enabled)
      break;
    case AIDifficultyLevel.GRANDMASTER:
      systemInstruction = `You are a grandmaster-level chess AI playing as ${currentPlayer}. Play the absolute best chess possible, considering deep lines and complex strategies.
      Return move as JSON: {"from": [row,col], "to": [row,col], "promotion": "Q" | "R" | "B" | "N" (if any)}.`;
      thinkingConfig = undefined; // Allow maximum thinking time (default enabled)
      break;
    default: // Fallback for any unexpected difficulty value
      console.warn(`Unexpected AI difficulty: ${difficulty}. Defaulting to Medium settings.`);
      systemInstruction = `You are a chess engine playing as ${currentPlayer}. Your goal is to win.
Provide the best move as a JSON object: {"from": [row, col], "to": [row, col]}.
If pawn promotion: {"from": [row, col], "to": [row, col], "promotion": "Q" | "R" | "B" | "N"}.
Board is 0-indexed: row 0 is Black's back rank, col 0 is Queen-side. Only legal moves.`;
      thinkingConfig = undefined; 
      difficulty = AIDifficultyLevel.MEDIUM; // Coerce for logging
      break;
  }
  
  console.log(`AI Difficulty: ${difficulty}, Thinking Config: ${thinkingConfig ? JSON.stringify(thinkingConfig) : 'Default (enabled)'}`);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(promptPayload),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        // Spread thinkingConfig only if it's defined (i.e., not undefined)
        ...(thinkingConfig !== undefined && { thinkingConfig }), 
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
    // Fallback to offline AI if online AI fails for any reason other than missing key
    if (API_KEY) { // Only try offline if API_KEY was present but call failed
        console.log("Gemini API error. Falling back to offline random move generator.");
        return getComputerMove(boardState, currentPlayer, castlingRights, enPassantTarget, AIDifficultyLevel.EASY); // Fallback to easy random
    }
    return null;
  }
}

export async function getCoachMoveExplanation(
  boardState: BoardState,
  currentPlayer: PlayerColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  suggestedMove: AIMove
): Promise<string | null> {
  if (!ai) {
    return "AI Coach is offline. This is a good move because it follows standard chess principles.";
  }

  const formattedBoard = formatBoardForAI(boardState);
  const formattedCastlingRights = formatCastlingRightsForAI(castlingRights);
  const moveDescription = formatMoveForExplanation(suggestedMove, boardState, currentPlayer);

  const systemInstruction = `You are an expert chess coach. The player (${currentPlayer}) is considering the move: ${moveDescription}.
The current board state is (0-indexed, row 0 is Black's back rank, 'wP' is white Pawn, 'bR' is black Rook, '..' is empty):
${JSON.stringify(formattedBoard)}
Castling rights: ${JSON.stringify(formattedCastlingRights)}
En Passant target: ${enPassantTarget ? JSON.stringify(enPassantTarget) : 'none'}
Explain concisely (1-2 sentences, max 30 words) why this specific move (${moveDescription}) is a strong or strategically sound move for ${currentPlayer} in this situation. Focus on the immediate tactical or strategic benefits. Do not greet or use conversational filler. Be direct.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain the strategic value of the move: ${moveDescription}.`,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    const explanation = response.text?.trim();
    if (explanation) {
      return explanation;
    }
    return "Could not retrieve an explanation at this time.";
  } catch (error) {
    console.error("Error calling Gemini API for coach explanation:", error);
    return "An error occurred while fetching the explanation.";
  }
}

// --- Game Analysis ---

function moveToString(move: { from: Position, to: Position, promotion?: PieceType }): string {
    const fromAlg = String.fromCharCode(97 + move.from[1]) + (8 - move.from[0]);
    const toAlg = String.fromCharCode(97 + move.to[1]) + (8 - move.to[0]);
    return fromAlg + toAlg + (move.promotion?.toLowerCase() || '');
}

function uciToPositions(uci: string): { from: Position, to: Position, promotion?: PieceType } {
    const fromCol = uci.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRow = 8 - parseInt(uci.charAt(1), 10);
    const toCol = uci.charCodeAt(2) - 'a'.charCodeAt(0);
    const toRow = 8 - parseInt(uci.charAt(3), 10);
    const promotion = uci.length === 5 ? uci.charAt(4).toUpperCase() as PieceType : undefined;
    return { from: [fromRow, fromCol], to: [toRow, toCol], promotion };
};

export async function analyzeGame(moveHistory: MoveHistoryEntry[]): Promise<GameAnalysis | null> {
    if (!ai) {
        throw new Error("Gemini AI client not initialized. Analysis is unavailable.");
    }

    const movesUCI = moveHistory
        .map(entry => entry.lastMove ? moveToString(entry.lastMove) : null)
        .filter((move): move is string => move !== null);
        
    const systemInstruction = `You are a world-class chess grandmaster and analyst. You will be given a chess game as a sequence of moves in UCI format. Your task is to provide a comprehensive analysis of the game. You MUST identify key moments: blunders, mistakes, inaccuracies, and brilliant moves. For each move, provide a classification and a concise explanation. For significant mistakes/blunders, suggest a better alternative move. You MUST return the response as a single JSON object matching this TypeScript interface:
\`\`\`typescript
interface GameAnalysis {
  summary: string; // A 2-3 sentence summary of the game flow and outcome.
  fullAnalysis: Array<{
    moveNumber: number; // 1-indexed move number for the player (1 for White's first, 1 for Black's first, 2 for White's second...)
    color: 'White' | 'Black';
    moveNotation: string; // The move made in UCI format, e.g., "e2e4"
    san: string; // The move in Standard Algebraic Notation, e.g., "e4", "Nf3", "Bxc6+", "O-O". This is CRITICAL.
    classification: 'blunder' | 'mistake' | 'inaccuracy' | 'good' | 'excellent' | 'brilliant' | 'book';
    explanation: string; // e.g., "This move is a major blunder because it loses the queen."
    bestAlternative?: { // Optional: suggest a better move for blunders/mistakes
      moveNotation: string; // e.g., "g1f3"
      san: string; // e.g., "Nf3"
      explanation?: string; // Why this move is better
    };
  }>;
}
\`\`\`
Do NOT include any text outside of the JSON object. The entire output must be valid JSON.`;

    const promptPayload = {
        moves: movesUCI,
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: JSON.stringify(promptPayload),
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const parsedAnalysis = JSON.parse(jsonStr) as GameAnalysis;

        // Post-process to add from/to positions based on UCI
        parsedAnalysis.fullAnalysis.forEach((analyzedMove: AnalyzedMove) => {
            const { from, to, promotion } = uciToPositions(analyzedMove.moveNotation);
            analyzedMove.from = from;
            analyzedMove.to = to;
            if (promotion) analyzedMove.promotion = promotion;

            if (analyzedMove.bestAlternative) {
                const { from: altFrom, to: altTo, promotion: altPromo } = uciToPositions(analyzedMove.bestAlternative.moveNotation);
                analyzedMove.bestAlternative.from = altFrom;
                analyzedMove.bestAlternative.to = altTo;
                if (altPromo) analyzedMove.bestAlternative.promotion = altPromo;
            }
        });

        parsedAnalysis.keyMoments = parsedAnalysis.fullAnalysis.filter(
            m => m.classification === 'blunder' || m.classification === 'mistake' || m.classification === 'brilliant'
        );

        return parsedAnalysis;

    } catch (error) {
        console.error("Error calling Gemini API for game analysis:", error);
        return null;
    }
}