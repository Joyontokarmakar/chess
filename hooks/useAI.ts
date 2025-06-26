
import { useState, useEffect, useCallback } from 'react';
import { BoardState, PlayerColor, CastlingRights, Position, PieceType, AIMove, GameStatus, AIDifficultyLevel, GameMode, ToastType } from '../types';
import { getComputerMove as fetchComputerMove, getCoachMoveExplanation as fetchCoachExplanation } from '../utils/geminiApi';
import { getPossibleMoves } from '../utils/chessLogic'; // For validating AI moves
import { COACH_AI_PLAYER_NAME, AI_PLAYER_NAME } from '../constants';

interface UseAIProps {
  gameStatus: GameStatus;
  currentPlayer: PlayerColor;
  promotionSquare: Position | null;
  isResignModalOpen: boolean;
  isRenameModalOpen: boolean; // Assuming this is from useUIState
  boardState: BoardState;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  applyMove: (from: Position, to: Position, promotionType?: PieceType) => Promise<void>;
  timeLimitPerPlayer: number | null;
  aiDifficulty: AIDifficultyLevel;
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  gameMode: GameMode | null;
}
const pieceTypeToName = (type: PieceType): string => {
  switch (type) {
    case PieceType.PAWN: return 'Pawn';
    case PieceType.ROOK: return 'Rook';
    case PieceType.KNIGHT: return 'Knight';
    case PieceType.BISHOP: return 'Bishop';
    case PieceType.QUEEN: return 'Queen';
    case PieceType.KING: return 'King';
    default: return type;
  }
};


export const useAI = ({
  gameStatus, currentPlayer, promotionSquare, isResignModalOpen, isRenameModalOpen,
  boardState, castlingRights, enPassantTarget, applyMove,
  timeLimitPerPlayer, aiDifficulty, addToast, gameMode,
}: UseAIProps) => {
  const [isComputerThinking, setIsComputerThinkingState] = useState<boolean>(false);
  const [hintSuggestion, setHintSuggestionState] = useState<AIMove | null>(null);
  const [coachExplanation, setCoachExplanationState] = useState<string | null>(null);
  const [hintKey, setHintKeyState] = useState<string>(''); // For re-triggering hint animation

  const setIsComputerThinking = useCallback((thinking: boolean) => setIsComputerThinkingState(thinking), []);
  const setHintSuggestion = useCallback((move: AIMove | null) => setHintSuggestionState(move), []);
  const setCoachExplanation = useCallback((explanation: string | null) => setCoachExplanationState(explanation), []);
  const setHintKey = useCallback((key: string) => setHintKeyState(key), []);

  useEffect(() => {
    const isAIsTurn = (gameMode === 'computer' || gameMode === 'coach') && currentPlayer === PlayerColor.BLACK;
    if (isAIsTurn && !gameStatus.isGameOver && !promotionSquare && !isResignModalOpen && !isRenameModalOpen && !isComputerThinking) {
      setIsComputerThinkingState(true);
      const currentAiPlayerName = gameMode === 'coach' ? COACH_AI_PLAYER_NAME : AI_PLAYER_NAME;
      addToast(`${currentAiPlayerName} is thinking...`, 'info', 2500);

      const difficultyForThisMove = gameMode === 'coach' ? AIDifficultyLevel.GRANDMASTER : aiDifficulty;
      const aiMoveDelay = timeLimitPerPlayer ? Math.max(1000, Math.random() * 2000 + 1000) : 500;

      setTimeout(() => {
        fetchComputerMove(boardState, PlayerColor.BLACK, castlingRights, enPassantTarget, difficultyForThisMove)
          .then((aiMove: AIMove | null) => {
            if (aiMove && !gameStatus.isGameOver) {
              const pieceAtFrom = boardState[aiMove.from[0]]?.[aiMove.from[1]];
              if (pieceAtFrom && pieceAtFrom.color === PlayerColor.BLACK) {
                const AIsPossibleMoves = getPossibleMoves(boardState, aiMove.from, PlayerColor.BLACK, castlingRights, enPassantTarget);
                if (AIsPossibleMoves.some(m => m[0] === aiMove.to[0] && m[1] === aiMove.to[1])) {
                  applyMove(aiMove.from, aiMove.to, aiMove.promotion);
                } else {
                  console.error("AI suggested an illegal move:", aiMove, "Possible moves:", AIsPossibleMoves);
                  addToast(`${currentAiPlayerName} error: Illegal move. Your turn.`, 'error');
                  // setCurrentPlayer(PlayerColor.WHITE); // This should be handled by game state logic if AI fails
                  // setLastMove(null); 
                }
              } else {
                addToast(`${currentAiPlayerName} error: No piece to move or wrong piece. Your turn.`, 'error');
              }
            } else if (!gameStatus.isGameOver) {
              addToast(`${currentAiPlayerName} could not move. Your turn.`, 'error');
            }
          })
          .catch(error => {
            if (!gameStatus.isGameOver) {
              addToast(`Error with ${currentAiPlayerName}. Your turn.`, 'error');
            }
          })
          .finally(() => setIsComputerThinkingState(false));
      }, aiMoveDelay);
    }
  }, [
    currentPlayer, gameMode, gameStatus.isGameOver, promotionSquare, isResignModalOpen, isRenameModalOpen,
    boardState, castlingRights, enPassantTarget, applyMove, isComputerThinking,
    timeLimitPerPlayer, aiDifficulty, addToast
  ]);
  
  const formatMoveForToast = useCallback((move: AIMove, board: BoardState): string => {
    const piece = board[move.from[0]][move.from[1]];
    const pieceName = piece ? pieceTypeToName(piece.type) : "Piece";
    const fromAlg = String.fromCharCode(97 + move.from[1]) + (8 - move.from[0]);
    const toAlg = String.fromCharCode(97 + move.to[1]) + (8 - move.to[0]);
    let moveStr = `${pieceName} from ${fromAlg} to ${toAlg}`;
    if (move.promotion) moveStr += ` (promote to ${pieceTypeToName(move.promotion)})`;
    return moveStr;
  }, []);

  const handleRequestHint = useCallback(async () => {
    if (gameStatus.isGameOver || ((gameMode === 'computer' || gameMode === 'coach') && currentPlayer === PlayerColor.BLACK && isComputerThinking) || promotionSquare || isResignModalOpen || isRenameModalOpen) return;
    
    setIsComputerThinkingState(true);
    
    if (gameMode === 'coach') {
      addToast("Coach is thinking about a hint...", 'info', 3000);
      try {
        const moveSuggestion = await fetchComputerMove(boardState, currentPlayer, castlingRights, enPassantTarget, AIDifficultyLevel.GRANDMASTER);
        if (moveSuggestion) {
          setHintSuggestionState(moveSuggestion);
          setHintKeyState(Date.now().toString());
          const explanation = await fetchCoachExplanation(boardState, currentPlayer, castlingRights, enPassantTarget, moveSuggestion);
          setCoachExplanationState(explanation);
          const formattedMove = formatMoveForToast(moveSuggestion, boardState);
          addToast(`Coach advises: ${formattedMove}. ${explanation || ''}`, 'info', 10000);
          setTimeout(() => { setHintSuggestionState(null); setCoachExplanationState(null); }, 7000);
        } else { addToast("Coach couldn't find a suggestion.", 'warning'); }
      } catch (error) { addToast("Could not fetch coach's advice.", 'error'); }
      finally { setIsComputerThinkingState(false); }
    } else { // Fallback, normally hint button won't show for non-coach modes needing AI hint
      addToast("Requesting hint...", 'info', 2000);
      try {
        const hint = await fetchComputerMove(boardState, currentPlayer, castlingRights, enPassantTarget, AIDifficultyLevel.HARD);
        if (hint) {
          setHintSuggestionState(hint); setHintKeyState(Date.now().toString());
          addToast(`Hint: ${formatMoveForToast(hint, boardState)}`, 'info', 6000);
          setTimeout(() => setHintSuggestionState(null), 5000);
        } else { addToast("Hint not available.", 'warning'); }
      } catch (error) { addToast("Could not fetch hint.", 'error'); }
      finally { setIsComputerThinkingState(false); }
    }
  }, [
    gameStatus.isGameOver, gameMode, currentPlayer, isComputerThinking, promotionSquare, isResignModalOpen, isRenameModalOpen,
    boardState, castlingRights, enPassantTarget, addToast, formatMoveForToast
  ]);

  const resetAIState = useCallback(() => {
    setIsComputerThinkingState(false);
    setHintSuggestionState(null);
    setCoachExplanationState(null);
    setHintKeyState('');
  }, []);

  return {
    isComputerThinking, setIsComputerThinking,
    hintSuggestion, setHintSuggestion,
    coachExplanation, setCoachExplanation,
    hintKey, setHintKey,
    handleRequestHint,
    formatMoveForToast,
    resetAIState,
  };
};
