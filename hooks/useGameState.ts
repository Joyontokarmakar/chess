import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BoardState, PlayerColor, Position, PieceType, CastlingRights, GameStatus, Piece,
  GameOverReason, GameMode, OnlineGameState, ToastType, Puzzle, MoveHistoryEntry, AIMove
} from '../types';
import { createInitialBoard, INITIAL_CASTLING_RIGHTS, SOUND_CAPTURE, SOUND_MOVE, SOUND_WIN, PUZZLES, parseFEN } from '../constants';
import {
  getPossibleMoves, makeMove as performMakeMoveLogic, isKingInCheck, isCheckmate, isStalemate,
  findKingPosition, createDeepBoardCopy, boardToFEN
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
  playerAttemptingResign: PlayerColor | null;
  gameMode: GameMode | null; 
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string) => void;
  onlineGameIdForStorage: string | null;
  isOnlineGameReadyForStorage: boolean;
  updateOnlineGameState: (gameId: string, updatedState: Partial<OnlineGameState>) => void;
  lastMoveByRef: React.MutableRefObject<PlayerColor | null>;
  isResignModalOpen: boolean;
  localPlayerColorForStorage: PlayerColor | null;
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
  const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);

  // --- Puzzle Mode State ---
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [currentPuzzle, setCurrentPuzzleState] = useState<Puzzle | null>(null);
  const [puzzleSolutionStep, setPuzzleSolutionStep] = useState<number>(0);
  
  // --- Timer State (from useGameTimer) ---
  const [timeLimitPerPlayer, setTimeLimitPerPlayer] = useState<number | null>(null);
  const [player1TimeLeft, setPlayer1TimeLeft] = useState<number | null>(null);
  const [player2TimeLeft, setPlayer2TimeLeft] = useState<number | null>(null);
  const [gameStartTimeStamp, setGameStartTimeStamp] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const setGameStatus = useCallback((status: GameStatus) => {
    setGameStatusState(status);
    props.addToast(status.message, props.determineToastTypeForGameStatus(status));
  }, [props.addToast, props.determineToastTypeForGameStatus]);
  
  const createHistoryEntry = useCallback((
    boardState: BoardState, 
    currentPlayer: PlayerColor, 
    castlingRights: CastlingRights, 
    enPassantTarget: Position | null,
    capturedByWhite: Piece[], 
    capturedByBlack: Piece[], 
    gameStatus: GameStatus, 
    kingInCheckPosition: Position | null, 
    lastMove: { from: Position; to: Position } | null,
    player1TimeLeft: number | null, 
    player2TimeLeft: number | null,
    moveCount: number,
  ): MoveHistoryEntry => {
    const fullMoveNumber = Math.floor(moveCount / 2) + 1;
    // Note: Halfmove clock is simplified to 0 for this implementation.
    const fen = boardToFEN(boardState, currentPlayer, castlingRights, enPassantTarget, 0, fullMoveNumber);

    return {
      boardState: createDeepBoardCopy(boardState),
      currentPlayer,
      castlingRights: JSON.parse(JSON.stringify(castlingRights)),
      enPassantTarget,
      capturedByWhite: [...capturedByWhite],
      capturedByBlack: [...capturedByBlack],
      gameStatus: { ...gameStatus },
      kingInCheckPosition,
      lastMove: lastMove ? { ...lastMove } : null,
      fenBeforeMove: fen,
      player1TimeLeft,
      player2TimeLeft,
    };
  }, []);

  const addMoveToHistory = useCallback((entry: MoveHistoryEntry) => {
    setMoveHistory(prev => [...prev, entry]);
  }, []);

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
      const duration = gameStartTimeStamp ? (Date.now() - gameStartTimeStamp) / 1000 : null;
      saveHallOfFameEntry(
        gameStatusResult.winnerName || (gameStatusResult.reason === 'stalemate' ? "Draw" : "N/A"),
        gameStatusResult.winnerName === actingPlayerNameForStatus ? opponentPlayerNameForStatus : actingPlayerNameForStatus,
        props.gameMode,
        gameStartTimeStamp,
        duration,
        gameStatusResult.reason || (gameStatusResult.winner ? undefined : 'draw')
      );
    }
    
    setGameStatus(gameStatusResult);
    setKingInCheckPosition(newKingInCheckPos);
    return { gameStatusResult, newKingInCheckPos };
  }, [
      props.player1Name, props.player2Name, props.getCurrentPlayerRealName, props.getOpponentPlayerName,
      props.gameMode, gameStartTimeStamp, hasWinSoundPlayedThisGame, props.layoutSettings.isSoundEnabled,
      setGameStatus
  ]);
  
  // --- Timer Effect (from useGameTimer) ---
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!timeLimitPerPlayer || gameStatus.isGameOver || promotionSquare || props.isResignModalOpen || props.gameMode === 'puzzle') {
        return;
    }

    timerIntervalRef.current = setInterval(() => {
        let p1Time = player1TimeLeft;
        let p2Time = player2TimeLeft;
        let timedOutPlayer: PlayerColor | null = null;

        if (currentPlayer === PlayerColor.WHITE) {
            if (p1Time !== null) {
                p1Time -= 1;
                setPlayer1TimeLeft(p1Time);
                if (p1Time <= 0) {
                    timedOutPlayer = PlayerColor.WHITE;
                }
            }
        } else { // Black's turn
            if (p2Time !== null) {
                p2Time -= 1;
                setPlayer2TimeLeft(p2Time);
                if (p2Time <= 0) {
                    timedOutPlayer = PlayerColor.BLACK;
                }
            }
        }

        const shouldUpdateOnline = props.gameMode === 'online' && props.onlineGameIdForStorage && currentPlayer === props.localPlayerColorForStorage;

        if (timedOutPlayer) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            const winner = timedOutPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            updateGameStatus(boardState, winner, castlingRights, enPassantTarget, 'timeout').then(({ gameStatusResult }) => {
                 if (props.gameMode === 'online' && props.onlineGameIdForStorage) {
                    props.updateOnlineGameState(props.onlineGameIdForStorage, {
                        gameStatus: gameStatusResult,
                        player1TimeLeft: p1Time,
                        player2TimeLeft: p2Time,
                        lastMoveBy: timedOutPlayer,
                    });
                }
            });
        } else if (shouldUpdateOnline && props.onlineGameIdForStorage) {
            props.updateOnlineGameState(props.onlineGameIdForStorage, {
                player1TimeLeft: p1Time,
                player2TimeLeft: p2Time,
            });
        }
    }, 1000) as unknown as number;

    return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [
    currentPlayer, timeLimitPerPlayer, gameStatus.isGameOver, promotionSquare, props.isResignModalOpen,
    boardState, castlingRights, enPassantTarget, updateGameStatus, props.gameMode,
    props.onlineGameIdForStorage, player1TimeLeft, player2TimeLeft, props.localPlayerColorForStorage, props.updateOnlineGameState
  ]);

  const handleSuccessfulPuzzleMove = useCallback((comment?: string) => {
    if (currentPuzzle && puzzleSolutionStep + 1 >= currentPuzzle.solution.length) {
      const successMsg = `Correct! Puzzle Solved: ${currentPuzzle.title}`;
      props.addToast(successMsg, 'success');
      setGameStatus({ message: `Puzzle Solved! ${comment || ''}`, isGameOver: true });
    } else {
      const correctMsg = `Correct! ${comment || 'Good move!'}`;
      props.addToast(correctMsg, 'info');
    }
    setPuzzleSolutionStep(prev => prev + 1);
  }, [currentPuzzle, puzzleSolutionStep, props.addToast, setGameStatus]);

  const applyMove = useCallback(async (
    from: Position, to: Position, promotionType?: PieceType, isPuzzleMove: boolean = false
  ) => {
    const movingPiece = boardState[from[0]][from[1]];
    if (!movingPiece) return;

     if (!isPuzzleMove) {
        const historyEntry = createHistoryEntry(
            boardState, currentPlayer, castlingRights, enPassantTarget,
            capturedByWhite, capturedByBlack, gameStatus, kingInCheckPosition,
            lastMove, player1TimeLeft, player2TimeLeft, moveHistory.length
        );
        addMoveToHistory(historyEntry);
    }

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

    setBoardState(newBoard);
    
    if (isPuzzleMove) {
      const solutionMove = currentPuzzle?.solution.find(s => s.from[0] === from[0] && s.from[1] === from[1] && s.to[0] === to[0] && s.to[1] === to[1]);
      handleSuccessfulPuzzleMove(solutionMove?.comment);
      setSelectedPiecePosition(null); setPossibleMoves([]);
      return;
    }

    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);

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
          player1TimeLeft: player1TimeLeft,
          player2TimeLeft: player2TimeLeft,
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
            player1TimeLeft: player1TimeLeft,
            player2TimeLeft: player2TimeLeft,
            lastMoveBy: currentPlayer,
        });
      }
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [
    boardState, currentPlayer, castlingRights, enPassantTarget, capturedByWhite, capturedByBlack, 
    gameStatus, kingInCheckPosition, lastMove, player1TimeLeft, player2TimeLeft, moveHistory.length,
    addMoveToHistory, createHistoryEntry, updateGameStatus,
    props.getCurrentPlayerRealName, props.getOpponentPlayerName, props.layoutSettings.isSoundEnabled,
    props.gameMode, props.onlineGameIdForStorage,
    props.isOnlineGameReadyForStorage, props.updateOnlineGameState, props.lastMoveByRef,
    handleSuccessfulPuzzleMove, currentPuzzle
  ]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameStatus.isGameOver || promotionSquare) return;

    if (selectedPiecePosition) { // A piece is selected, this is a move attempt
        if (props.gameMode === 'puzzle') {
            const solutionMove = currentPuzzle?.solution[puzzleSolutionStep];
            if (solutionMove && solutionMove.from[0] === selectedPiecePosition[0] && solutionMove.from[1] === selectedPiecePosition[1] &&
                solutionMove.to[0] === pos[0] && solutionMove.to[1] === pos[1]) {
                
                const piece = boardState[selectedPiecePosition[0]][selectedPiecePosition[1]];
                if (piece?.type === PieceType.PAWN && (pos[0] === 0 || pos[0] === 7)) {
                    if (solutionMove.promotion) {
                        applyMove(selectedPiecePosition, pos, solutionMove.promotion, true);
                    } else {
                       applyMove(selectedPiecePosition, pos, undefined, true);
                    }
                } else {
                    applyMove(selectedPiecePosition, pos, undefined, true);
                }
            } else {
                props.addToast("Incorrect move. Try again!", 'error');
                setSelectedPiecePosition(null);
                setPossibleMoves([]);
            }
        } else {
            if (possibleMoves.some(move => move[0] === pos[0] && move[1] === pos[1])) {
                applyMove(selectedPiecePosition, pos);
            } else {
                setSelectedPiecePosition(null);
                setPossibleMoves([]);
                const piece = boardState[pos[0]][pos[1]];
                if (piece && piece.color === currentPlayer) {
                    setSelectedPiecePosition(pos);
                    setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
                }
            }
        }
    } else { // No piece selected, this is a selection attempt
        const piece = boardState[pos[0]][pos[1]];
        if (piece && piece.color === currentPlayer) {
            setSelectedPiecePosition(pos);
            setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
        }
    }
  }, [
    boardState, currentPlayer, selectedPiecePosition, possibleMoves, castlingRights, enPassantTarget,
    gameStatus.isGameOver, promotionSquare, applyMove, props.gameMode, props.addToast,
    currentPuzzle, puzzleSolutionStep
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
            player1TimeLeft: player1TimeLeft,
            player2TimeLeft: player2TimeLeft,
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
    props.updateOnlineGameState, props.lastMoveByRef, player1TimeLeft, player2TimeLeft
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

    const duration = gameStartTimeStamp ? (Date.now() - gameStartTimeStamp) / 1000 : null;
    if (props.gameMode && props.gameMode !== 'puzzle') {
        saveHallOfFameEntry(winnerName, loserName, props.gameMode, gameStartTimeStamp, duration, 'resignation');
    }

    if (props.gameMode === 'online' && props.onlineGameIdForStorage) {
        props.updateOnlineGameState(props.onlineGameIdForStorage, {
            gameStatus: newGameStatus,
            player1TimeLeft: player1TimeLeft,
            player2TimeLeft: player2TimeLeft,
            lastMoveBy: playerAttemptingResign,
        });
        props.lastMoveByRef.current = playerAttemptingResign;
    }
    props.setIsResignModalOpen(false);
    props.setPlayerAttemptingResign(null);
  }, [
    gameStatus.isGameOver, props.player1Name, props.player2Name, props.layoutSettings.isSoundEnabled,
    props.gameMode, gameStartTimeStamp, props.onlineGameIdForStorage,
    props.updateOnlineGameState, props.lastMoveByRef, setGameStatus,
    props.setIsResignModalOpen, props.setPlayerAttemptingResign, props.playerAttemptingResign,
    player1TimeLeft, player2TimeLeft
  ]);

  const handleUndoMove = useCallback(() => {
    if (moveHistory.length === 0 || gameStatus.isGameOver || 
        promotionSquare || props.isResignModalOpen) {
      return;
    }

    const lastState = moveHistory[moveHistory.length - 1];
    setBoardState(lastState.boardState);
    setCurrentPlayer(lastState.currentPlayer);
    setCastlingRights(lastState.castlingRights);
    setEnPassantTarget(lastState.enPassantTarget);
    setCapturedByWhite(lastState.capturedByWhite);
    setCapturedByBlack(lastState.capturedByBlack);
    setGameStatus(lastState.gameStatus);
    props.addToast("Last move undone.", 'info');
    setKingInCheckPosition(lastState.kingInCheckPosition);
    setLastMove(lastState.lastMove);
    setPlayer1TimeLeft(lastState.player1TimeLeft);
    setPlayer2TimeLeft(lastState.player2TimeLeft);
    setSelectedPiecePosition(null);
    setPossibleMoves([]);
    setPromotionSquare(null);

    setMoveHistory(prev => prev.slice(0, -1));
  }, [moveHistory, gameStatus.isGameOver, promotionSquare, props.isResignModalOpen, props.addToast, setGameStatus]);


  const resetTimerState = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setTimeLimitPerPlayer(null);
    setPlayer1TimeLeft(null);
    setPlayer2TimeLeft(null);
    setGameStartTimeStamp(null);
  }, []);
  
  const resetCoreGameState = useCallback(() => {
    resetTimerState();
    setBoardState(createInitialBoard());
    setCurrentPlayer(PlayerColor.WHITE);
    setSelectedPiecePosition(null);
    setPossibleMoves([]);
    setCastlingRights(INITIAL_CASTLING_RIGHTS);
    setEnPassantTarget(null);
    setPromotionSquare(null);
    setKingInCheckPosition(null);
    setGameStatusState({ message: "Select a mode.", isGameOver: false });
    setLastMove(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setHasWinSoundPlayedThisGame(false);
    setMoveHistory([]);
    // Reset puzzle state
    setCurrentPuzzleIndex(0);
    setCurrentPuzzleState(null);
    setPuzzleSolutionStep(0);
  }, [resetTimerState]);

  const loadPuzzle = useCallback((index: number) => {
    if (index < 0 || index >= PUZZLES.length) return;
    
    resetCoreGameState(); // Start with a clean slate
    
    const puzzle = PUZZLES[index];
    setCurrentPuzzleState(puzzle);
    setCurrentPuzzleIndex(index);
    setPuzzleSolutionStep(0);
    
    let initialBoardFromPuzzle: BoardState;
    let playerToMoveFromPuzzle: PlayerColor;
    let castlingRightsFromPuzzle: CastlingRights = { ...INITIAL_CASTLING_RIGHTS };
    let enPassantTargetFromPuzzle: Position | null = null;

    if (puzzle.fen) {
      const fenData = parseFEN(puzzle.fen);
      initialBoardFromPuzzle = fenData.board;
      playerToMoveFromPuzzle = fenData.playerToMove;
      castlingRightsFromPuzzle = fenData.castlingRights;
      enPassantTargetFromPuzzle = fenData.enPassantTarget;
    } else if (puzzle.initialBoard) {
      initialBoardFromPuzzle = createDeepBoardCopy(puzzle.initialBoard);
      playerToMoveFromPuzzle = puzzle.playerToMove;
      if (puzzle.initialCastlingRights) castlingRightsFromPuzzle = JSON.parse(JSON.stringify(puzzle.initialCastlingRights));
      if (puzzle.initialEnPassantTarget) enPassantTargetFromPuzzle = [...puzzle.initialEnPassantTarget] as Position;
    } else {
      initialBoardFromPuzzle = createInitialBoard();
      playerToMoveFromPuzzle = PlayerColor.WHITE;
    }

    setBoardState(initialBoardFromPuzzle);
    setCurrentPlayer(playerToMoveFromPuzzle);
    setCastlingRights(castlingRightsFromPuzzle);
    setEnPassantTarget(enPassantTargetFromPuzzle);
    const kcip = isKingInCheck(initialBoardFromPuzzle, playerToMoveFromPuzzle) ? findKingPosition(initialBoardFromPuzzle, playerToMoveFromPuzzle) : null;
    setKingInCheckPosition(kcip);
    
    const puzzleStartMessage = puzzle.description;
    setGameStatus({ message: puzzleStartMessage, isGameOver: false });
    props.addToast(puzzleStartMessage, 'info');
    props.setPlayer1Name(playerToMoveFromPuzzle === PlayerColor.WHITE ? "White" : "Black");
    props.setPlayer2Name(playerToMoveFromPuzzle === PlayerColor.WHITE ? "Black" : "White");

  }, [resetCoreGameState, props.addToast, props.setPlayer1Name, props.setPlayer2Name, setGameStatus]);

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
    // Puzzle exports
    currentPuzzle,
    currentPuzzleIndex,
    puzzleSolutionStep,
    setPuzzleSolutionStep,
    loadPuzzle,
    // Timer exports
    timeLimitPerPlayer, setTimeLimitPerPlayer,
    player1TimeLeft, setPlayer1TimeLeft,
    player2TimeLeft, setPlayer2TimeLeft,
    gameStartTimeStamp, setGameStartTimeStamp,
    resetTimerState,
    // History exports
    moveHistory,
    handleUndoMove,
  };
};