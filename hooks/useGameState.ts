

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BoardState, PlayerColor, Position, PieceType, CastlingRights, GameStatus, Piece,
  MakeMoveResult, GameOverReason, GameMode, OnlineGameState, ToastType,
  MoveHistoryEntry, Puzzle, PuzzleSolutionMove
} from '../types';
import { createInitialBoard, INITIAL_CASTLING_RIGHTS, SOUND_CAPTURE, SOUND_MOVE, SOUND_WIN } from '../constants';
import {
  getPossibleMoves, makeMove as performMakeMoveLogic, isKingInCheck, isCheckmate, isStalemate,
  findKingPosition, createDeepBoardCopy
} from '../utils/chessLogic';
import { playSound } from '../utils/soundUtils';
import { saveHallOfFameEntry } from '../utils/localStorageUtils'; 

interface UseGameStateProps {
  player1Name: string;
  player2Name: string;
  getCurrentPlayerRealName: (currentPlayer: PlayerColor) => string;
  getOpponentPlayerName: (currentPlayer: PlayerColor) => string;
  layoutSettings: { isSoundEnabled: boolean; boardStyleId: string; }; 
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  determineToastTypeForGameStatus: (status: GameStatus) => ToastType;
  setPlayerAttemptingResign: React.Dispatch<React.SetStateAction<PlayerColor | null>>;
  setIsResignModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerAttemptingResign: PlayerColor | null; // Needed for resignation logic
  gameMode: GameMode | null; 
  gameStartTimeStamp: number | null; 
  // Online play dependencies
  onlineGameIdForStorage: string | null;
  isOnlineGameReadyForStorage: boolean;
  updateOnlineGameState: (gameId: string, updatedState: Partial<OnlineGameState>) => void;
  lastMoveByRef: React.MutableRefObject<PlayerColor | null>;
  // Puzzle mode dependencies
  currentPuzzle: Puzzle | null;
  handleSuccessfulPuzzleMove: (comment?: string) => void;
  // Timer dependencies
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
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


export const useGameState = (props: UseGameStateProps) => {
  const [boardState, setBoardState] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(PlayerColor.WHITE);
  const [selectedPiecePosition, setSelectedPiecePosition] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(INITIAL_CASTLING_RIGHTS);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [kingInCheckPosition, setKingInCheckPosition] = useState<Position | null>(null);
  const [gameStatus, setGameStatusState] = useState<GameStatus>({ message: "Select a mode.", isGameOver: false });
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
  const [hasWinSoundPlayedThisGame, setHasWinSoundPlayedThisGame] = useState<boolean>(false);

  const setGameStatus = useCallback((status: GameStatus) => {
    setGameStatusState(status);
    props.addToast(status.message, props.determineToastTypeForGameStatus(status));
  }, [props.addToast, props.determineToastTypeForGameStatus]);


  const updateGameStatus = useCallback(async (
    board: BoardState, actingPlayer: PlayerColor, currentCR: CastlingRights,
    currentEPT: Position | null, reason: GameOverReason | null, moveMessagePreamble?: string
  ): Promise<{ gameStatusResult: GameStatus; newKingInCheckPos: Position | null; }> => {
    const opponentColor = actingPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    const actingPlayerNameForStatus = props.getCurrentPlayerRealName(actingPlayer);
    const opponentPlayerNameForStatus = props.getOpponentPlayerName(actingPlayer);

    let newKingInCheckPos: Position | null = null;
    let statusMsg = moveMessagePreamble || "Move successful.";
    let gameStatusResult: GameStatus;

    if (reason === 'timeout') {
      gameStatusResult = {
        message: `${opponentPlayerNameForStatus}'s time ran out! ${actingPlayerNameForStatus} wins by timeout!`,
        isGameOver: true, winner: actingPlayer, winnerName: actingPlayerNameForStatus, reason: 'timeout'
      };
    } else if (isKingInCheck(board, opponentColor)) {
      newKingInCheckPos = findKingPosition(board, opponentColor);
      statusMsg = `${moveMessagePreamble ? moveMessagePreamble + ". " : ""}${opponentPlayerNameForStatus} is in Check!`;
      if (isCheckmate(board, opponentColor, currentCR, currentEPT)) {
        gameStatusResult = {
          message: `Magnificent Checkmate! ${actingPlayerNameForStatus} conquers the board!`,
          isGameOver: true, winner: actingPlayer, winnerName: actingPlayerNameForStatus, reason: 'checkmate'
        };
      } else {
        gameStatusResult = { message: statusMsg, isGameOver: false };
      }
    } else if (isStalemate(board, opponentColor, currentCR, currentEPT)) {
      gameStatusResult = { message: "A hard-fought Stalemate! The game is a draw.", isGameOver: true, reason: 'stalemate' };
    } else {
      const nextPlayerName = opponentColor === PlayerColor.WHITE ? props.player1Name : props.player2Name;
      const turnMsg = `${nextPlayerName}'s turn.`;
      statusMsg = moveMessagePreamble ? `${moveMessagePreamble}. ${turnMsg}` : turnMsg;
      gameStatusResult = { message: statusMsg, isGameOver: false };
    }

    if (gameStatusResult.isGameOver && !hasWinSoundPlayedThisGame) {
      if (gameStatusResult.winner || gameStatusResult.reason === 'stalemate') {
        playSound(SOUND_WIN, props.layoutSettings.isSoundEnabled);
        setHasWinSoundPlayedThisGame(true);
      }
    }
    
    if (gameStatusResult.isGameOver && props.gameMode && props.gameMode !== 'puzzle') {
      const duration = props.gameStartTimeStamp ? (Date.now() - props.gameStartTimeStamp) / 1000 : null;
      saveHallOfFameEntry(
        gameStatusResult.winnerName || (gameStatusResult.reason === 'stalemate' ? "Draw" : "N/A"),
        gameStatusResult.winnerName === actingPlayerNameForStatus ? opponentPlayerNameForStatus : actingPlayerNameForStatus,
        props.gameMode,
        props.gameStartTimeStamp,
        duration,
        gameStatusResult.reason || (gameStatusResult.winner ? undefined : 'draw')
      );
    }
    
    setGameStatus(gameStatusResult);
    setKingInCheckPosition(newKingInCheckPos);
    return { gameStatusResult, newKingInCheckPos };
  }, [
      props.player1Name, props.player2Name, props.getCurrentPlayerRealName, props.getOpponentPlayerName,
      props.gameMode, props.gameStartTimeStamp, hasWinSoundPlayedThisGame, props.layoutSettings.isSoundEnabled,
      setGameStatus
  ]);

  const applyMove = useCallback(async (
    from: Position, to: Position, promotionType?: PieceType
  ) => {
    
    const movingPiece = boardState[from[0]][from[1]];
    if (!movingPiece) return;

    const { newBoard, newCastlingRights, newEnPassantTarget, promotionSquare: promSq, capturedPiece } =
      performMakeMoveLogic(boardState, from, to, castlingRights, enPassantTarget, promotionType);

    const newLastMove = { from, to };
    setLastMove(newLastMove);

    let moveMessagePreamble = "";
    let newCapturedByWhite = [...capturedByWhite];
    let newCapturedByBlack = [...capturedByBlack];

    if (capturedPiece) {
      playSound(SOUND_CAPTURE, props.layoutSettings.isSoundEnabled);
      if (currentPlayer === PlayerColor.WHITE) { newCapturedByWhite.push(capturedPiece); }
      else { newCapturedByBlack.push(capturedPiece); }
      setCapturedByWhite(newCapturedByWhite);
      setCapturedByBlack(newCapturedByBlack);
      moveMessagePreamble = `${props.getCurrentPlayerRealName(currentPlayer)}'s ${pieceTypeToName(movingPiece.type)} captured ${props.getOpponentPlayerName(currentPlayer)}'s ${pieceTypeToName(capturedPiece.type)}`;
    } else {
      playSound(SOUND_MOVE, props.layoutSettings.isSoundEnabled);
    }

    setBoardState(newBoard); setCastlingRights(newCastlingRights); setEnPassantTarget(newEnPassantTarget);

    if (props.gameMode === 'online' && props.onlineGameIdForStorage && props.isOnlineGameReadyForStorage) {
      props.lastMoveByRef.current = currentPlayer;
    } else {
      props.lastMoveByRef.current = null;
    }

    if (promSq && !promotionType) {
      setPromotionSquare(promSq);
      if (props.gameMode === 'online' && props.onlineGameIdForStorage) {
        props.updateOnlineGameState(props.onlineGameIdForStorage, {
          boardState: newBoard, castlingRights: newCastlingRights, enPassantTarget: newEnPassantTarget,
          capturedByWhite: newCapturedByWhite, capturedByBlack: newCapturedByBlack, lastMove: newLastMove,
          player1TimeLeft: props.player1TimeLeft,
          player2TimeLeft: props.player2TimeLeft,
          lastMoveBy: currentPlayer,
        });
      }
    } else {
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const { gameStatusResult: finalGameStatus, newKingInCheckPos: finalKcip } =
        await updateGameStatus(newBoard, currentPlayer, newCastlingRights, newEnPassantTarget, null, moveMessagePreamble);

      if (props.gameMode === 'online' && props.onlineGameIdForStorage && props.isOnlineGameReadyForStorage) {
         props.updateOnlineGameState(props.onlineGameIdForStorage, {
            boardState: newBoard, currentPlayer: finalGameStatus.isGameOver ? currentPlayer : nextPlayer,
            castlingRights: newCastlingRights, enPassantTarget: newEnPassantTarget,
            capturedByWhite: newCapturedByWhite, capturedByBlack: newCapturedByBlack,
            gameStatus: finalGameStatus, kingInCheckPosition: finalKcip, lastMove: newLastMove,
            player1TimeLeft: props.player1TimeLeft,
            player2TimeLeft: props.player2TimeLeft,
            lastMoveBy: currentPlayer,
        });
      }
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [
    boardState, currentPlayer, castlingRights, enPassantTarget, updateGameStatus,
    props.getCurrentPlayerRealName, props.getOpponentPlayerName, props.layoutSettings.isSoundEnabled,
    capturedByWhite, capturedByBlack, props.gameMode, props.onlineGameIdForStorage,
    props.isOnlineGameReadyForStorage, props.updateOnlineGameState, props.lastMoveByRef,
    props.player1TimeLeft, props.player2TimeLeft
  ]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameStatus.isGameOver || promotionSquare) return;

    if (props.gameMode === 'puzzle' && props.currentPuzzle) {
      const piece = boardState[pos[0]][pos[1]];
      if(selectedPiecePosition) {
        if(possibleMoves.some(move => move[0] === pos[0] && move[1] === pos[1])) {
          props.handleSuccessfulPuzzleMove(props.currentPuzzle.solution.find(
            s => s.from[0] === selectedPiecePosition[0] && s.from[1] === selectedPiecePosition[1] && s.to[0] === pos[0] && s.to[1] === pos[1]
          )?.comment);
        } else {
          setSelectedPiecePosition(null); setPossibleMoves([]);
        }
      } else if (piece && piece.color === currentPlayer) {
        setSelectedPiecePosition(pos);
        setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
      }
    } else { // Normal game modes
      const piece = boardState[pos[0]][pos[1]];
      if (selectedPiecePosition) {
        if (possibleMoves.some(move => move[0] === pos[0] && move[1] === pos[1])) {
          applyMove(selectedPiecePosition, pos);
        } else {
          setSelectedPiecePosition(null); setPossibleMoves([]);
          if (piece && piece.color === currentPlayer) {
            setSelectedPiecePosition(pos);
            setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
          }
        }
      } else if (piece && piece.color === currentPlayer) {
        setSelectedPiecePosition(pos);
        setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
      }
    }
  }, [
    boardState, currentPlayer, selectedPiecePosition, possibleMoves, castlingRights, enPassantTarget,
    gameStatus.isGameOver, promotionSquare, applyMove, props.gameMode, props.currentPuzzle,
    props.handleSuccessfulPuzzleMove
  ]);

  const handlePromotion = useCallback(async (pieceType: PieceType) => {
    if (!promotionSquare) return;
    
    const tempBoard = createDeepBoardCopy(boardState);
    const pawnToPromote = tempBoard[promotionSquare[0]][promotionSquare[1]];
    if(pawnToPromote && pawnToPromote.type === PieceType.PAWN) {
      tempBoard[promotionSquare[0]][promotionSquare[1]] = {...pawnToPromote, type: pieceType, id: pawnToPromote.id.replace(/P\d*$/, pieceType)};
      setBoardState(tempBoard);

      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const promoMessage = `${props.getCurrentPlayerRealName(currentPlayer)} promoted Pawn to ${pieceTypeToName(pieceType)}!`;

      const { gameStatusResult: finalGameStatus, newKingInCheckPos: kcipAfterPromo } =
          await updateGameStatus(tempBoard, currentPlayer, castlingRights, enPassantTarget, null, promoMessage);

      if (props.gameMode === 'online' && props.onlineGameIdForStorage) {
         props.updateOnlineGameState(props.onlineGameIdForStorage, {
            boardState: tempBoard, currentPlayer: finalGameStatus.isGameOver ? currentPlayer : nextPlayer,
            gameStatus: finalGameStatus, kingInCheckPosition: kcipAfterPromo, lastMove,
            player1TimeLeft: props.player1TimeLeft,
            player2TimeLeft: props.player2TimeLeft,
            lastMoveBy: currentPlayer,
        });
        props.lastMoveByRef.current = currentPlayer;
      }
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setPromotionSquare(null); setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [
    boardState, promotionSquare, currentPlayer, castlingRights, enPassantTarget, updateGameStatus,
    props.getCurrentPlayerRealName, props.gameMode, props.onlineGameIdForStorage, lastMove,
    props.updateOnlineGameState, props.lastMoveByRef, props.player1TimeLeft, props.player2TimeLeft
  ]);
  
  const executeResignation = useCallback(() => {
    const playerAttemptingResign = props.playerAttemptingResign;
    if (!playerAttemptingResign || gameStatus.isGameOver) return;

    const winnerColor = playerAttemptingResign === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    const winnerName = winnerColor === PlayerColor.WHITE ? props.player1Name : props.player2Name;
    const loserName = playerAttemptingResign === PlayerColor.WHITE ? props.player1Name : props.player2Name;
    
    const newGameStatus: GameStatus = {
        message: `${loserName} resigned. ${winnerName} wins the game!`,
        isGameOver: true, winner: winnerColor, winnerName: winnerName, reason: 'resignation',
    };
    setGameStatus(newGameStatus);
    setKingInCheckPosition(null);
    playSound(SOUND_WIN, props.layoutSettings.isSoundEnabled);
    setHasWinSoundPlayedThisGame(true);

    const duration = props.gameStartTimeStamp ? (Date.now() - props.gameStartTimeStamp) / 1000 : null;
    if (props.gameMode && props.gameMode !== 'puzzle') {
        saveHallOfFameEntry(winnerName, loserName, props.gameMode, props.gameStartTimeStamp, duration, 'resignation');
    }

    if (props.gameMode === 'online' && props.onlineGameIdForStorage) {
        props.updateOnlineGameState(props.onlineGameIdForStorage, {
            gameStatus: newGameStatus,
            player1TimeLeft: props.player1TimeLeft,
            player2TimeLeft: props.player2TimeLeft,
            lastMoveBy: playerAttemptingResign,
        });
        props.lastMoveByRef.current = playerAttemptingResign;
    }
    props.setIsResignModalOpen(false);
    props.setPlayerAttemptingResign(null);
  }, [
    gameStatus.isGameOver, props.player1Name, props.player2Name, props.layoutSettings.isSoundEnabled,
    props.gameMode, props.gameStartTimeStamp, props.onlineGameIdForStorage,
    props.updateOnlineGameState, props.lastMoveByRef, setGameStatus,
    props.setIsResignModalOpen, props.setPlayerAttemptingResign, props.playerAttemptingResign
  ]);
  
  const resetCoreGameState = useCallback(() => {
    setBoardState(createInitialBoard());
    setCurrentPlayer(PlayerColor.WHITE);
    setSelectedPiecePosition(null);
    setPossibleMoves([]);
    setCastlingRights(INITIAL_CASTLING_RIGHTS);
    setEnPassantTarget(null);
    setPromotionSquare(null);
    setKingInCheckPosition(null);
    setGameStatusState({ message: "Select a mode.", isGameOver: false }); // Use direct setter to avoid initial toast
    setLastMove(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setHasWinSoundPlayedThisGame(false);
  }, []);


  return {
    boardState, setBoardState,
    currentPlayer, setCurrentPlayer,
    selectedPiecePosition, setSelectedPiecePosition,
    possibleMoves, setPossibleMoves,
    castlingRights, setCastlingRights,
    enPassantTarget, setEnPassantTarget,
    promotionSquare, setPromotionSquare,
    kingInCheckPosition, setKingInCheckPosition,
    gameStatus, setGameStatus, 
    lastMove, setLastMove,
    capturedByWhite, setCapturedByWhite,
    capturedByBlack, setCapturedByBlack,
    hasWinSoundPlayedThisGame, setHasWinSoundPlayedThisGame,
    applyMove,
    handleSquareClick,
    handlePromotion,
    updateGameStatus,
    executeResignation,
    resetCoreGameState,
  };
};